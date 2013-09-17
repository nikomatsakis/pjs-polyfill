if (typeof(libdir) === "undefined") { load("Util.js"); } else { load(libdir+"/"+"Util.js"); }

// Test name format:

// map<N>DimensionalArrayOf<G1>sTo<G2>s where <N> is a positive integer
// (or its equivalent word in English) and <G1> and <G2> are both
// grain types (potentially an array themselves.)

function mapOneDimensionalArrayOfStructsToStructs() {
  var grain = new StructType({f: uint32});
  var type = new ArrayType(grain, 4);
  var i1 = type.build(x => new grain({f: x}));
  var r1 = i1.mapPar(type, g => new grain({f: g.f * 2}));
  var r2 = type.build(x => new grain({f: x * 2}));
  assertTypedEqual(type, r1, new type([{f:0}, {f:2},
                                       {f:4}, {f:6}]));
  assertTypedEqual(type, r1, r2);
}

mapOneDimensionalArrayOfStructsToStructs();

function mapTwoDimensionalArrayOfStructsToStructs() {
  var grain = new StructType({f: uint32});
  var type = new ArrayType(new ArrayType(grain, 2), 2);
  var i1 = type.build(2, (x, y) => { return new grain({f: x * 10 + y}); });
  // var r1 = i1.mapPar(type, 
}