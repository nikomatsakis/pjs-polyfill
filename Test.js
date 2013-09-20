if (typeof(libdir) === "undefined") { load("Util.js"); } else { load(libdir+"/"+"Util.js"); }

function oneDimensionalArrayOfUints() {
  var grain = uint32;
  var type = new ArrayType(grain, 4);
  var r1 = type.build(x => x * 2);
  var r2 = type.build((x, out) => Handle.set(out, x * 2));
  assertTypedEqual(type, r1, new type([0, 2, 4, 6]));
  assertTypedEqual(type, r1, r2);
}

function oneDimensionalArrayOfStructs() {
  var grain = new StructType({f: uint32});
  var type = new ArrayType(grain, 4);
  var r1 = type.build(x => new grain({f: x * 2}));
  var r2 = type.build((x, out) => { out.f = x * 2; });
  assertTypedEqual(type, r1, new type([{f:0}, {f:2},
                                       {f:4}, {f:6}]));
  assertTypedEqual(type, r1, r2);
}

function twoDimensionalArrayOfStructsWithDepth2() {
  var grain = new StructType({f: uint32});
  var type = new ArrayType(new ArrayType(grain, 2), 2);

  var r1 = type.build(2, (x, y) => {
    return new grain({f: x * 10 + y});
  });

  var r2 = type.build(2, (x, y, out) => {
    out.f = x * 10 + y;
  });

  assertTypedEqual(type, r1, new type([[{f:00}, {f:01}],
                                       [{f:10}, {f:11}]]));
  assertTypedEqual(type, r1, r2);
}

function twoDimensionalArrayOfStructsWithDepth1() {
  var grain = new ArrayType(new StructType({f: uint32}), 2);
  var type = new ArrayType(grain, 2);

  var r1 = type.build((x) => {
    return new grain([{f: x * 10},
                      {f: x * 10 + 1}]);
  });

  var r2 = type.build(1, (x, out) => {
    out[0].f = x * 10 + 0;
    out[1].f = x * 10 + 1;
  });

  assertTypedEqual(type, r1, new type([[{f:00}, {f:01}],
                                       [{f:10}, {f:11}]]));
  assertTypedEqual(type, r1, r2);
}

function reduceUint8s() {
  var uint8Array = new ArrayType(uint8, 5);
  var array = new uint8Array([128, 129, 130, 131, 132]);

  var sum = array.reducePar(uint8, (a, b) => {
    print("Hi", a, b);
    return a + b
  });
  assertEq(sum, (128+129+130+131+132) % 256);

  var sum = array.reducePar(float64, (a, b) => a + b);
  assertEq(sum, 128+129+130+131+132);
}

function reduceVectorss() {
  var VectorType = new ArrayType(uint32, 3);
  var VectorsType = new ArrayType(VectorType, 3);
  var array = new VectorsType([[1, 2, 3],
                               [4, 5, 6],
                               [7, 8, 9]]);

  var sum = array.reducePar(VectorType, vectorAdd);
  assertTypedEqual(VectorType,
                   sum,
                   new VectorType([1+4+7,
                                   2+5+8,
                                   3+6+9]));

  function vectorAdd(l, r) {
    assertEq(l.length, r.length);
    for (var i = 0; i < l.length; i++)
      l[i] += r[i];
  }
}

try {

  oneDimensionalArrayOfUints();

  oneDimensionalArrayOfStructs();

  twoDimensionalArrayOfStructsWithDepth2();

  twoDimensionalArrayOfStructsWithDepth1();

  // reduceUint8s();

} catch (e) {
  print(e.name);
  print(e.message);
  print(e.stack);
  throw e;
}
