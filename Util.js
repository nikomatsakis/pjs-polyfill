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
var objectType = TypedObject.objectType;

function assertTypedEqual(type, a_orig, b_orig) {
  try {
    recur(type, a_orig, b_orig);
  } catch (e) {
    print("failure during "+
          "assertTypedEqual("+type.toSource()+", "+a_orig.toSource()+", "+b_orig.toSource()+")");
    throw e;
  }

  function recur(type, a, b) {
    if (type instanceof ArrayType) {
      assertEq(a.length, type.length);
      assertEq(b.length, type.length);
      for (var i = 0; i < type.length; i++)
        recur(type.elementType, a[i], b[i]);
      } else if (type instanceof StructType) {
        for (var idx in type.fieldNames) {
          let fieldName = type.fieldNames[idx];
          if (type.fieldTypes[fieldName] !== undefined) {
            recur(type.fieldTypes[fieldName], a[fieldName], b[fieldName]);
          } else {
            throw new Error("assertTypedEqual no type for "+
                            "fieldName: "+fieldName+" in type: "+type.toSource());
          }
        }
      } else {
        assertEq(a, b);
      }
  }
}
