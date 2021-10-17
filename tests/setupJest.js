jest.mock("chalk", () => ({
  cyan: jest.fn(),
  red: jest.fn(),
  underline: jest.fn(),
}));
jest.mock("inquirer");
jest.mock("progress");
jest.mock("update-notifier");
