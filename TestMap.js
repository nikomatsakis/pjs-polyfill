if (typeof(libdir) === "undefined") { load("Util.js"); } else { load(libdir+"/"+"Util.js"); }

// Test name format:

// map<N>DimensionalArrayOf<G1>sTo<G2>s where <N> is a positive integer
// (or its equivalent word in English) and <G1> and <G2> are both
// grain types (potentially an array themselves.)

var Grain = new StructType({f: uint32});
function wrapG(v) { return new Grain({f: v}); }
function doubleG(g) { return new Grain({f: g.f * 2}); }
function tenG(x, y) { return new Grain({f: x * 10 + y}); }

function mapOneDimensionalArrayOfStructsToStructs() {
  var type = new ArrayType(Grain, 4);
  var i1 = type.build(wrapG);
  var r1 = i1.mapPar(type, doubleG);
  var r2 = i1.mapPar(type, 1, doubleG);
  assertTypedEqual(type, r1, new type([{f:0}, {f:2},
                                       {f:4}, {f:6}]));
  assertTypedEqual(type, r1, r2);
}

mapOneDimensionalArrayOfStructsToStructs();

function mapTwoDimensionalArrayOfStructsToStructs() {
  var rowtype = new ArrayType(Grain, 2);
  var type = new ArrayType(rowtype, 2);
  var i1 = type.build(2, tenG);
  var r1 = i1.mapPar(type, 2, doubleG);
  var r2 = i1.mapPar(type, 1, (m) => m.mapPar(rowtype, 1, doubleG));
  assertTypedEqual(type, r1, new type([[{f:00}, {f:01}],
                                       [{f:10}, {f:11}]]));
  assertTypedEqual(type, r1, r2);
}

mapTwoDimensionalArrayOfStructsToStructs();

function mapOneDimensionalArrayOfStructsToArrayOfStructs() {
  var Line = new ArrayType(Grain, 2);
  var Box = new ArrayType(Line, 2);
  var i1 = Line.build(wrapG);
  var r1 = i1.mapPar(Box, (g) => Line.build((y) => tenG(g.f, y)));
  var r2 = i1.mapPar(Box, (g) => i1.mapPar(Line, (y) => tenG(g.f, y)));
  assertTypedEqual(Box, r1, new Box([[{f:00}, {f:01}],
                                     [{f:10}, {f:11}]]));
  assertTypedEqual(Box, r1, r2);
}

mapOneDimensionalArrayOfStructsToArrayOfStructs();
