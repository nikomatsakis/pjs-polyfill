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
  var iterationSpace = [];
  var totalLength = 1;
  var grainType = arrayType;
  for (var i = 0; i < depth; i++) {
    if (grainType instanceof ArrayType) {
      iterationSpace.push(grainType.length);
      totalLength *= grainType.length;
      grainType = grainType.elementType;
    } else {
      throw new RangeError("Depth too high");
    }
  }

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

