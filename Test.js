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

function assertTypedEqual(type, a, b) {
  if (type instanceof ArrayType) {
    assertEq(a.length, type.length);
    assertEq(b.length, type.length);
    for (var i = 0; i < type.length; i++)
      assertTypedEqual(type.elementType, a[i], b[i])
  } else if (type instanceof StructType) {
    for (var fieldName in type.fieldNames) {
      assertTypedEqual(type.fieldTypes[fieldName],
                       a[fieldName],
                       b[fieldName]);
    }
  }
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

oneDimensionalArrayOfStructs();

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
                                       [{f:10}, {f:10}]]));
  assertTypedEqual(type, r1, r2);
}

twoDimensionalArrayOfStructsWithDepth2();

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
                                       [{f:10}, {f:10}]]));
  assertTypedEqual(type, r1, r2);
}

twoDimensionalArrayOfStructsWithDepth1();
