/**
 * Gets the key of an object.
 * @param {*} object
 * @param {string} value
 * @example
 * const obj = { foo: { bar: 10 } };
 * const result = getValue(obj, "foo.bar"); // 10
 */
export function getValue(object, value) {
  return value.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, object);
}
