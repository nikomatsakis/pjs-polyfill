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


function oneDimensionalArrayOfIntegers() {
  var grain = new StructType({f: uint32});
  var type = new ArrayType(grain, 4);
  var r1 = type.build(x => new grain({f: x * 2}));
  var r2 = type.build((x, out) => { out.f = x * 2; });
  assertTypedEqual(type, r1, new type([{f:0}, {f:2},
                                       {f:4}, {f:6}]));
  assertTypedEqual(type, r1, r2);
}

oneDimensionalArrayOfIntegers();
