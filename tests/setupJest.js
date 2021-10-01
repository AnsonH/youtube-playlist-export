jest.mock("chalk", () => ({
  red: jest.fn(),
  underline: jest.fn(),
}));
jest.mock("inquirer");
jest.mock("update-notifier");
