if (typeof(libdir) === "undefined") { load("Util.js"); } else { load(libdir+"/"+"Util.js"); }

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

try {

  oneDimensionalArrayOfStructs();

  twoDimensionalArrayOfStructsWithDepth2();

  twoDimensionalArrayOfStructsWithDepth1();

} catch (e) {
  print(e.name);
  print(e.message);
  print(e.stack);
  throw e;
}
