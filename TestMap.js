function load_lib(n) { load(typeof(libdir)==="undefined" ? n : libdir+"/"+n); }
load_lib("Util.js");

// Test name format:

// map<N>DimArrayOf<G1>sTo<G2>s where <N> is a positive integer (or its
// equivalent word in English) and <G1> and <G2> are both grain types
// (potentially an array themselves.)

function mapOneDimArrayOfUint8ToUint32s() {
  var intype = uint8.array(4);
  var type = uint32.array(4);
  var i1 = intype.build(i => i);
  var r1 = i1.mapPar(type, j => j*2);
  var r2 = i1.mapPar(type, 1, j => j*2);
  assertTypedEqual(type, r1, new type([0, 2, 4, 6]));
  assertTypedEqual(type, r1, r2);
}

function mapOneDimArrayOfUint32ToUint8s() {
  var intype = uint32.array(4);
  var type = uint8.array(4);
  var i1 = intype.build(i => i);
  var r1 = i1.mapPar(type, j => j*200);
  var r2 = i1.mapPar(type, 1, j => j*200);
  assertTypedEqual(type, r1, new type([0, 200, 400 % 256, 600 % 256]));
  assertTypedEqual(type, r1, r2);
}

function mapTwoDimArrayOfUint8ToUint32s() {
  var intype = uint8.array(4).array(4);
  var rowtype = uint32.array(4);
  var type = rowtype.array(4);
  var i1 = new type([[10, 11, 12, 13],
                     [20, 21, 22, 23],
                     [30, 31, 32, 33],
                     [40, 41, 42, 43]]);

  var r1 = i1.mapPar(type, 2, x => x*2);
  var r2 = i1.mapPar(type, 1, a => a.mapPar(rowtype, 1, x => x*2));
  var r3 = i1.mapPar(type, 1, a => a.mapPar(rowtype, 1, (x, j, c, out) => Handle.set(out, x*2)));
  var r4 = i1.mapPar(type, 1, (a, j, c, out) => { out[0] = a[0]*2;
                                                  out[1] = a[1]*2;
                                                  out[2] = a[2]*2;
                                                  out[3] = a[3]*2; });
  assertTypedEqual(type, r1, new type([[20, 22, 24, 26],
                                       [40, 42, 44, 46],
                                       [60, 62, 64, 66],
                                       [80, 82, 84, 86]]));
  assertTypedEqual(type, r1, r2);
  assertTypedEqual(type, r1, r3);
  assertTypedEqual(type, r1, r4);
}

function mapTwoDimArrayOfUint32ToUint8s() {
  var intype = uint32.array(4).array(4);
  var rowtype = uint8.array(4);
  var type = rowtype.array(4);
  var i1 = new type([[10, 11, 12, 13],
                     [20, 21, 22, 23],
                     [30, 31, 32, 33],
                     [40, 41, 42, 43]]);

  var r1 = i1.mapPar(type, 2, x => x*2);
  var r2 = i1.mapPar(type, 1, a => a.mapPar(rowtype, 1, x => x*2));
  var r3 = i1.mapPar(type, 1, a => a.mapPar(rowtype, 1, (x, j, c, out) => Handle.set(out, x*2)));
  var r4 = i1.mapPar(type, 1, (a, j, c, out) => { out[0] = a[0]*2;
                                                  out[1] = a[1]*2;
                                                  out[2] = a[2]*2;
                                                  out[3] = a[3]*2; });
  assertTypedEqual(type, r1, new type([[20, 22, 24, 26],
                                       [40, 42, 44, 46],
                                       [60, 62, 64, 66],
                                       [80, 82, 84, 86]]));
  assertTypedEqual(type, r1, r2);
  assertTypedEqual(type, r1, r3);
  assertTypedEqual(type, r1, r4);
}

function mapOneDimArrayOfArrayOfUint8ToUint32s() {
  var intype = uint8.array(4).array(4);
  var type = uint32.array(4);
  var i1 = new intype([[0xdd, 0xcc, 0xbb, 0xaa],
                       [0x09, 0x08, 0x07, 0x06],
                       [0x15, 0x14, 0x13, 0x12],
                       [0x23, 0x32, 0x41, 0x50]]);

  function combine(a,b,c,d) { return a << 24 | b << 16 | c << 8 | d; }

  var r1 = i1.mapPar(type, x => combine(x[0], x[1], x[2], x[3]));
  var r2 = i1.mapPar(type, 1, (x, i, c, out) => Handle.set(out, combine(x[0], x[1], x[2], x[3])));
  assertTypedEqual(type, r1, new type([0xddccbbaa, 0x09080706, 0x15141312, 0x23324150]));
  assertTypedEqual(type, r1, r2);
}

function mapOneDimArrayOfUint32ToArrayOfUint8s() {
  var intype = uint32.array(4);
  var type = uint8.array(4).array(4);
  var i1 = new intype([0xddccbbaa, 0x09080706, 0x15141312, 0x23324150]);

  function divide(a) { return [a >> 24 & 0xFF, a >> 16 & 0xFF, a >> 8 & 0xFF, a & 0xFF]; }

  var r1 = i1.mapPar(type, x => divide(x));
  var r2 = i1.mapPar(type, 1, (x, i, c, out) => {
                       var [a,b,c,d] = divide(x);
                       out[0] = a; out[1] = b; out[2] = c; out[3] = d;
                     });
  assertTypedEqual(type, r1, new type([[0xdd, 0xcc, 0xbb, 0xaa],
                                       [0x09, 0x08, 0x07, 0x06],
                                       [0x15, 0x14, 0x13, 0x12],
                                       [0x23, 0x32, 0x41, 0x50]]));
  assertTypedEqual(type, r1, r2);
}

var Grain = new StructType({f: uint32});
function wrapG(v) { return new Grain({f: v}); }
function doubleG(g) { return new Grain({f: g.f * 2}); }
function tenG(x, y) { return new Grain({f: x * 10 + y}); }

function mapOneDimArrayOfStructsToStructs() {
  var type = Grain.array(4);
  var i1 = type.build(wrapG);
  var r1 = i1.mapPar(type, doubleG);
  var r2 = i1.mapPar(type, 1, doubleG);
  var r3 = i1.mapPar(type, 1, (g, j, c, out) => { out.f = g.f * 2; });
  assertTypedEqual(type, r1, new type([{f:0}, {f:2},
                                       {f:4}, {f:6}]));
  assertTypedEqual(type, r1, r2);
  assertTypedEqual(type, r1, r3);
}

function mapTwoDimArrayOfStructsToStructs() {
  var rowtype = Grain.array(2);
  var type = rowtype.array(2);
  var i1 = type.build(2, tenG);
  var r1 = i1.mapPar(type, 2, doubleG);
  var r2 = i1.mapPar(type, 1, (m) => m.mapPar(rowtype, 1, doubleG));
  var r3 = i1.mapPar(type, 1, (m, j, c, out) => { out[0].f = m[0].f * 2; out[1].f = m[1].f * 2; });
  assertTypedEqual(type, r1, new type([[{f:00}, {f:02}],
                                       [{f:20}, {f:22}]]));
  assertTypedEqual(type, r1, r2);
  assertTypedEqual(type, r1, r3);
}

function mapOneDimArrayOfStructsToArrayOfStructs() {
  var Line = Grain.array(2);
  var Box = Line.array(2);
  var i1 = Line.build(wrapG);
  var r1 = i1.mapPar(Box, (g) => Line.build((y) => tenG(g.f, y)));
  var r2 = i1.mapPar(Box, (g) => i1.mapPar(Line, (y) => tenG(g.f, y.f)));
  var r3 = i1.mapPar(Box, (g, j, c, out) => { out[0] = tenG(g.f, 0); out[1] = tenG(g.f, 1); });
  assertTypedEqual(Box, r1, new Box([[{f:00}, {f:01}],
                                     [{f:10}, {f:11}]]));
  assertTypedEqual(Box, r1, r2);
  assertTypedEqual(Box, r1, r3);
}

try {

  mapOneDimArrayOfUint8ToUint32s();
  mapOneDimArrayOfUint32ToUint8s();

  mapTwoDimArrayOfUint8ToUint32s();
  mapTwoDimArrayOfUint32ToUint8s();

  mapOneDimArrayOfArrayOfUint8ToUint32s();
  mapOneDimArrayOfUint32ToArrayOfUint8s();

  mapOneDimArrayOfStructsToStructs();

  mapTwoDimArrayOfStructsToStructs();

  mapOneDimArrayOfStructsToArrayOfStructs();

} catch (e) {
  print(e.name);
  print(e.message);
  print(e.stack);
  throw e;
}
