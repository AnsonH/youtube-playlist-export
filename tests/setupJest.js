jest.mock("chalk", () => ({
  blue: jest.fn(),
  blueBright: jest.fn(),
  cyan: jest.fn(),
  green: jest.fn(),
  red: jest.fn(),
  underline: jest.fn(),
  yellow: jest.fn(),
}));
jest.mock("inquirer");
jest.mock("ora", () =>
  jest.fn().mockReturnValue({
    start: jest.fn(function () {
      // `this` = The object argument of mockReturnValue that contains `start`, `succeed` & `fail` properties
      // We MUST use `function() {}` syntax here instead of `() => {}`
      return this;
    }),
    succeed: jest.fn(),
    fail: jest.fn(),
  })
);
jest.mock("progress");

// Fix all console.XXX is undefined errors
jest.spyOn(console, "log").mockImplementation((msg) => msg);
jest.spyOn(console, "error").mockImplementation((msg) => msg);
