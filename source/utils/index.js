/**
 * Gets the key of an object.
 * @param {*} object
 * @param {string} keyPath
 * @returns {any|null} `null` if the path refers to non-existing property
 * @example
 * const obj = { foo: { bar: 10 } };
 * const result = getValue(obj, "foo.bar"); // 10
 */
export function getValue(object, keyPath) {
  return keyPath.split(".").reduce((prev, curr) => {
    if (prev) {
      return prev[curr] ?? null;
    }
    return null;
  }, object);
}
