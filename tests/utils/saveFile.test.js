import * as saveFile from "../../utils/saveFile";

describe("saveFile", () => {
  describe("getExportName", () => {
    let dateSpy;
    let formatNameSpy;

    beforeAll(() => {
      const randomDate = new Date("2021-04-20");
      dateSpy = jest.spyOn(global, "Date").mockReturnValue(randomDate);
      formatNameSpy = jest.spyOn(saveFile, "formatName").mockImplementation((name) => name);
    });

    afterAll(() => {
      dateSpy.mockRestore();
      formatNameSpy.mockRestore();
    });

    it("should append date at beginning", () => {
      const name = saveFile.getExportName("foo");
      expect(name).toBe("2021-04-20-foo");
    });

    it("should add a file extension if it's given", () => {
      const fileName = saveFile.getExportName("foo", "json");
      expect(fileName).toBe("2021-04-20-foo.json");
    });
  });

  describe("formatName", () => {
    it("should replace spaces with _ symbol", () => {
      expect(saveFile.formatName("Lorem Ipsum")).toBe("Lorem_Ipsum");
    });

    it("should remove illegal characters", () => {
      const name = '<"a">:b/\\c|d?e*';
      expect(saveFile.formatName(name)).toBe("abcde");
    });
  });
});
