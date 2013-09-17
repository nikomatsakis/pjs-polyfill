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
      assertTypedEqual(type.elementType, a[i], b[i]);
  } else if (type instanceof StructType) {
    for (var fieldName in type.fieldNames) {
      assertTypedEqual(type.fieldTypes[fieldName],
                       a[fieldName],
                       b[fieldName]);
    }
  }
}
