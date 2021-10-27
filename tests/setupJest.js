jest.mock("chalk", () => ({
  blue: jest.fn(),
  cyan: jest.fn(),
  green: jest.fn(),
  red: jest.fn(),
  underline: jest.fn(),
  yellow: jest.fn(),
}));
jest.mock("inquirer");
jest.mock("progress");

// Fix all console.XXX is undefined errors
jest.spyOn(console, "log").mockImplementation((msg) => msg);
jest.spyOn(console, "error").mockImplementation((msg) => msg);
