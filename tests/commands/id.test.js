import c from "chalk";
import inquirer from "inquirer";
import idActionHandler, * as id from "../../source/commands/id";
import * as api from "../../source/lib/api";
import Config from "../../source/lib/Config";
import saveFile from "../../source/utils/saveFile";
import * as stubs from "../stubs";

const fileExt = "json";
const folderPath = "/foo/bar";

jest.mock("../../source/lib/api");
jest.mock("../../source/lib/Config");
jest.mock("../../source/utils/saveFile");
inquirer.prompt.mockResolvedValue({
  fileExt,
  folderPath,
  exportItems: stubs.exportItemsAll,
});

const configGetMockImp = (key) => {
  switch (key) {
    case "apiKey":
      return "fakeApiKey";
    case "fileExt":
      return fileExt;
    case "folderPath":
      return folderPath;
    default:
      return "";
  }
};

const saveFileOptions = {
  fileExt,
  folderPath,
  playlistTitle: stubs.playlist.title,
};

const errorPlaylistNotFound = JSON.stringify({ status: 404, reason: "playlistNotFound" });

describe("id command", () => {
  describe("idActionHandler", () => {
    let handleApiErrorMock;

    beforeEach(() => {
      Config.prototype.get.mockImplementation(configGetMockImp);
      handleApiErrorMock = jest.spyOn(id, "handleApiError").mockImplementation(() => null);
    });

    afterEach(() => {
      handleApiErrorMock.mockRestore();
    });

    describe("resolve to false", () => {
      it("should resolve to false if playlist ID is Watch Later", async () => {
        expect.assertions(3);
        const status = await idActionHandler("WL", { default: false });

        expect(c.yellow.mock.calls[0][0]).toBe(
          "WARNING: Videos in Watch Later playlist cannot be retrieved through the YouTube API."
        );
        expect(c.yellow.mock.calls[1][0]).toBe("Please try another playlist.");
        expect(status).toBe(false);
      });

      it("should resolve to false if API Key is missing", async () => {
        expect.assertions(3);
        Config.prototype.get.mockImplementation(() => ""); // Empty API key

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(c.yellow).toHaveBeenCalledWith("WARNING:");
        expect(c.cyan).toHaveBeenCalledWith("`ytpl-export key`");
        expect(status).toBe(false);
      });

      it("should resolve to false if failed to fetch playlist metadata", async () => {
        expect.assertions(2);
        api.getPlaylistMetadata.mockImplementationOnce(() => {
          throw new Error(errorPlaylistNotFound);
        });

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorPlaylistNotFound));
        expect(status).toBe(false);
      });

      it("should resolve to false if the playlist is empty", async () => {
        expect.assertions(2);
        api.getPlaylistMetadata.mockResolvedValueOnce({
          title: "",
          numOfVideos: 0,
        });

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(c.green).toHaveBeenCalledWith(
          "This playlist is empty and there are no video data to export."
        );
        expect(status).toBe(false);
      });

      it("should resolve to false if failed to fetch playlist data and --default is true", async () => {
        expect.assertions(2);
        api.getPlaylistData.mockImplementationOnce(() => {
          throw new Error(errorPlaylistNotFound);
        });
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);

        const status = await idActionHandler(stubs.playlist.playlistId, { default: true });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorPlaylistNotFound));
        expect(status).toBe(false);
      });

      it("should resolve to false if failed to fetch playlist data and --default is false", async () => {
        expect.assertions(2);
        api.getPlaylistData.mockImplementationOnce(() => {
          throw new Error(errorPlaylistNotFound);
        });
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorPlaylistNotFound));
        expect(status).toBe(false);
      });
    });

    describe("resolve to true", () => {
      beforeEach(() => {
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);
        Config.prototype.getExportItemsDefaults.mockReturnValueOnce(stubs.exportItemsAll);
        api.getPlaylistData.mockResolvedValueOnce(stubs.playlist.fullJsonOutput);
      });

      it("should skip all prompts if --default flag is true", async () => {
        expect.assertions(5);
        const status = await idActionHandler(stubs.playlist.playlistId, { default: true });

        expect(api.getPlaylistMetadata).toHaveBeenCalledWith(stubs.playlist.playlistId);
        expect(Config.prototype.getExportItemsDefaults).toHaveBeenCalledWith();
        expect(api.getPlaylistData).toHaveBeenCalledWith(
          stubs.playlist.playlistId,
          stubs.exportItemsAll,
          stubs.playlist.numOfVideos
        );
        expect(saveFile).toHaveBeenCalledWith(stubs.playlist.fullJsonOutput, saveFileOptions);
        expect(status).toBe(true);
      });

      it("should ask prompt if --default flag is false", async () => {
        expect.assertions(5);

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(api.getPlaylistMetadata).toHaveBeenCalledWith(stubs.playlist.playlistId);
        expect(Config.prototype.getExportItemsDefaults).toHaveBeenCalledWith();
        expect(api.getPlaylistData).toHaveBeenCalledWith(
          stubs.playlist.playlistId,
          stubs.exportItemsAll,
          stubs.playlist.numOfVideos
        );
        expect(saveFile).toHaveBeenCalledWith(stubs.playlist.fullJsonOutput, saveFileOptions);
        expect(status).toBe(true);
      });
    });
  });
});
