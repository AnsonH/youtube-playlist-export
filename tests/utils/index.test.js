import { getValue } from "../../utils/index";

describe("getValue", () => {
  const testObj = { foo: 0, bar: { baz: [1, 2] } };

  it("should return the correct value given a proper key path", () => {
    expect(getValue(testObj, "foo")).toBe(0);
    expect(getValue(testObj, "bar.baz")).toStrictEqual([1, 2]);
  });

  it("should return null for invalid key path", () => {
    expect(getValue(testObj, "hi")).toBeNull();
    expect(getValue(testObj, "foo.hi")).toBeNull();
    expect(getValue(testObj, "bar.hi")).toBeNull();
  });
});
