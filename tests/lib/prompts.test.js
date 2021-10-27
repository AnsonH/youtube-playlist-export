import c from "chalk";
import isAbsolute from "is-absolute";
import * as prompts from "../../source/lib/prompts";

jest.mock("is-absolute");

describe("prompts", () => {
  describe("validateExportItems", () => {
    it("should return error message if no item is selected", () => {
      prompts.validateExportItems([]);
      expect(c.red).toHaveBeenCalledWith("Select at least 1 item to export");
    });

    it("should return true if at least 1 item is selected", () => {
      expect(prompts.validateExportItems(["title"])).toBe(true);
    });
  });

  describe("validateFilePath", () => {
    it("should return true if input is an absolute path", () => {
      isAbsolute.mockReturnValue(true);
      expect(prompts.validateFilePath("/foo/bar")).toBe(true);
    });

    it("should return an error message if input is not an absolute path", () => {
      isAbsolute.mockReturnValue(false);
      prompts.validateFilePath("foo/bar");
      expect(c.red).toHaveBeenCalledWith("Please enter a valid absolute path!");
    });
  });
});
