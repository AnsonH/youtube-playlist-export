import fs from "fs";
import { Parser } from "json2csv";
import path from "path";
import saveFile, * as sf from "../../utils/saveFile";
import * as stubs from "../stubs";

jest.spyOn(path, "join").mockImplementation((...paths) => paths.join("/"));

describe("saveFile", () => {
  let consoleErrorMock, fsMock;
  const fakePath = "/foo/bar";

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation((msg) => msg);
  });

  afterEach(() => {
    consoleErrorMock.mockClear();
    fsMock?.mockClear();
  });

  describe("saveFile", () => {
    let createFolderMock, getExportNameMock, jsonMock;

    beforeEach(() => {
      fsMock = jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
      createFolderMock = jest.spyOn(sf, "createFolder").mockReturnValue(true);
      getExportNameMock = jest.spyOn(sf, "getExportName");
      jsonMock = jest.spyOn(JSON, "stringify").mockImplementation((obj) => obj);
    });

    afterEach(() => {
      createFolderMock.mockRestore();
      getExportNameMock.mockRestore();
      jsonMock.mockRestore();
    });

    it("should return false immediately if it fails to create folder", () => {
      createFolderMock = jest.spyOn(sf, "createFolder").mockReturnValue(false);

      const status = saveFile(stubs.playlist.fullJsonOutput, {
        fileExt: "csv",
        folderPath: fakePath,
        playlistTitle: stubs.playlist.title,
      });
      expect(status).toBe(false);
    });

    it("should write as JSON successfully and return true", () => {
      getExportNameMock.mockReturnValue(stubs.playlist.fileNameJson);

      const status = saveFile(stubs.playlist.fullJsonOutput, {
        fileExt: "json",
        folderPath: fakePath,
        playlistTitle: stubs.playlist.title,
      });

      const fakeFilePath = `${fakePath}/${stubs.playlist.fileNameJson}`;
      expect(fsMock).toHaveBeenCalledWith(fakeFilePath, stubs.playlist.fullJsonOutput);
      expect(status).toBe(true);
    });

    it("should write as CSV successfully and return true", () => {
      getExportNameMock.mockReturnValue(stubs.playlist.fileNameCsv);
      const csvParserMock = jest
        .spyOn(Parser.prototype, "parse")
        .mockImplementation(() => "fake csv output");

      const status = saveFile(stubs.playlist.fullJsonOutput, {
        fileExt: "csv",
        folderPath: fakePath,
        playlistTitle: stubs.playlist.title,
      });

      const fakeFilePath = `${fakePath}/${stubs.playlist.fileNameCsv}`;
      expect(csvParserMock).toHaveBeenCalledWith(stubs.playlist.fullJsonOutput);
      expect(fsMock).toHaveBeenCalledWith(fakeFilePath, "fake csv output");
      expect(status).toBe(true);

      csvParserMock.mockRestore();
    });

    it("should return false when it fails to save file", () => {
      fsMock = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
        throw new Error("Error");
      });

      const status = saveFile(stubs.playlist.fullJsonOutput, {
        fileExt: "csv",
        folderPath: fakePath,
        playlistTitle: stubs.playlist.title,
      });

      expect(status).toBe(false);
    });
  });

  describe("createFolder", () => {
    it("should return true immediately if path already exists", () => {
      fsMock = jest.spyOn(fs, "existsSync").mockReturnValue(true);
      expect(sf.createFolder(fakePath)).toBe(true);
    });

    it("should create directory and return true if path doesn't exist", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      fsMock = jest.spyOn(fs, "mkdirSync");

      const status = sf.createFolder(fakePath);
      expect(fsMock).toHaveBeenCalledWith(fakePath, { recursive: true });
      expect(status).toBe(true);
    });

    it("should return false if it fails to create folder", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      fsMock = jest.spyOn(fs, "mkdirSync").mockImplementation(() => {
        throw new Error("Error");
      });

      const status = sf.createFolder(fakePath);
      expect(fsMock).toHaveBeenCalledWith(fakePath, { recursive: true });
      expect(status).toBe(false);
    });
  });

  describe("getExportName", () => {
    let dateSpy;
    let formatNameSpy;

    beforeAll(() => {
      const randomDate = new Date("2021-10-15");
      dateSpy = jest.spyOn(global, "Date").mockReturnValue(randomDate);
      formatNameSpy = jest.spyOn(sf, "formatName").mockImplementation((name) => name);
    });

    afterAll(() => {
      dateSpy.mockRestore();
      formatNameSpy.mockRestore();
    });

    it("should append date at beginning", () => {
      const name = sf.getExportName("foo");
      expect(name).toBe("2021-10-15-foo");
    });

    it("should add a file extension if it's given", () => {
      const fileName = sf.getExportName("foo", "json");
      expect(fileName).toBe("2021-10-15-foo.json");
    });
  });

  describe("formatName", () => {
    it("should replace spaces with _ symbol", () => {
      expect(sf.formatName("Lorem Ipsum")).toBe("Lorem_Ipsum");
    });

    it("should remove illegal characters", () => {
      const name = '<"a">:b/\\c|d?e*';
      expect(sf.formatName(name)).toBe("abcde");
    });
  });
});
