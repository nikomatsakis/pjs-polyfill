(function() {
  var ArrayType = TypedObject.ArrayType;
  var StructType = TypedObject.StructType;
  var Handle = TypedObject.Handle;
  var uint8 = TypedObject.uint8;
  var uint16 = TypedObject.uint16;
  var uint32 = TypedObject.uint32;
  var int8 = TypedObject.int8;
  var int16 = TypedObject.int16;
  var int32 = TypedObject.int32;
  var float32 = TypedObject.float32;
  var float64 = TypedObject.float64;

  ArrayType.prototype.build = function build(a, b) {
    if (typeof a === "function")
      return buildExplicit(this, 1, a);
    else
      return buildExplicit(this, a, b);
  };

  function buildExplicit(arrayType, depth, func) {
    if (depth <= 0 || (depth|0) !== depth)
      throw new RangeError("Bad depth");

    if (arrayType.variable)
      throw new TypeError("Can't build unsized array type");

    // For example, if we have as input
    //    ArrayType(ArrayType(T, 4), 5)
    // and a depth of 2, we get
    //    grainType = T
    //    iterationSpace = [5, 4]
    var [iterationSpace, grainType, totalLength] =
      computeIterationSpace(arrayType, depth);

    // Create a zeroed instance with no data
    var result = new arrayType();

    var indices = [];
    for (var i = 0; i < depth; i++)
      indices.push(0);

    // FIXME add redimension, rewrite using that
    // FIXME test for Handle.move

    var handle = grainType.handle();
    for (var i = 0; i < totalLength; i++) {
      // Position handle to point at &result[...indices]
      var args = [handle, result].concat(indices);
      Handle.move.apply(null, args);

      // Invoke func(...indices, out)
      var r = func.apply(null, indices.concat([handle]));
      if (r !== undefined)
        Handle.set(handle, r); // *handle = r

      // Increment indices.
      increment(indices, iterationSpace);
    }

    return result;
  }

  function computeIterationSpace(arrayType, depth) {
    var iterationSpace = [];
    var totalLength = 1;
    var grainType = arrayType;
    for (var i = 0; i < depth; i++) {
      if (grainType instanceof ArrayType) {
        iterationSpace.push(grainType.length);
        totalLength *= grainType.length;
        grainType = grainType.elementType;
      } else {
        throw new RangeError("Depth "+depth+" too high");
      }
    }
    return [iterationSpace, grainType, totalLength];
  }

  function increment(indices, iterationSpace) {
    // Increment something like
    //     [5, 5, 7, 8]
    // in an iteration space of
    //     [9, 9, 9, 9]
    // to
    //     [5, 5, 8, 0]

    assertEq(indices.length, iterationSpace.length);
    var n = indices.length - 1;
    while (true) {
      indices[n] += 1;
      if (indices[n] < iterationSpace[n])
        return;

      assertEq(indices[n], iterationSpace[n]);
      indices[n] = 0;
      if (n == 0)
        return;

      n -= 1;
    }
  }

  ArrayType.prototype.buildPar = Array.prototype.build;

  /*
   * For code like:
   *
   *   var A = new ArrayType(uint8, 10);
   *
   * then
   *
   *   A.prototype.__proto__ === ArrayType.prototype.prototype
   *
   * and thus calls like (new A()).mapPar can reach methods attached
   * to ArrayType.prototype.prototype (but not methods attached to
   * ArrayType.prototype).
   *
   */

  ArrayType.prototype.prototype.mapPar = function(a, b, c) {
    // Arguments: outputArrayType, [depth], func
    const any = {name:"not-yet-defined"}; // FIXME we need any
    if (typeof a !== "object")
      throw new TypeError("missing output array type argument to ArrayType mapPar");
    else if (typeof b === "number" && typeof c === "function")
      return mapExplicit(this, b, a, c);
    else if (typeof b === "function")
      return mapExplicit(this, 1, a, b);
    else
      throw new TypeError("missing function argument to ArrayType mapPar");
  };

  function mapExplicit(inArray, depth, outputType, func) {
    if (depth <= 0 || (depth|0) !== depth)
      throw new RangeError("Bad depth");

    if (outputType.variable)
      throw new TypeError("Can't build unsized array type");

    // Compute iteration space for input and output and compare
    var inputType = TypedObject.type(inArray);
    var [inIterationSpace, inGrainType, _] =
      computeIterationSpace(inputType, depth);
    var [iterationSpace, outGrainType, totalLength] =
      computeIterationSpace(outputType, depth);
    for (var i = 0; i < depth; i++)
      if (inIterationSpace[i] !== iterationSpace[i])
        throw new TypeError("Incompatible iteration space in input and output type");

    // Create a zeroed instance with no data
    var result = new outputType();

    var indices = [];
    for (var i = 0; i < depth; i++)
      indices.push(0);

    // FIXME add redimension, rewrite using that
    // FIXME test for Handle.move

    var inHandle = inGrainType.handle();
    var outHandle = outGrainType.handle();

    var inGrainTypeIsScalar = !(inGrainType instanceof ArrayType ||
                                inGrainType instanceof StructType);

    for (var i = 0; i < totalLength; i++) {
      // Position handle to point at &result[...indices]
      Handle.move.apply(null, [inHandle, result].concat(indices));
      Handle.move.apply(null, [outHandle, result].concat(indices));

      // Awkward. Reify if this is a scalar.
      var element = (inGrainTypeIsScalar ? Handle.get(inHandle) : inHandle);

      // Invoke func(element, ...indices, collection, out)
      var args = [element];
      Array.push.apply(args, indices);
      args.push(inArray, outHandle);
      var r = func.apply(null, args);
      if (r !== undefined)
        Handle.set(outHandle, r); // *handle = r

      // Increment indices.
      increment(indices, iterationSpace);
    }

    return result;
  }

})();
