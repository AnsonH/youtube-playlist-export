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

const errorQuotaExceeded = JSON.stringify({ status: 403, reason: "quotaExceeded" });
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
        c.yellow.mockClear();
      });

      it("should resolve to false if API Key is missing", async () => {
        expect.assertions(3);
        Config.prototype.get.mockImplementation(() => ""); // Empty API key

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(c.yellow).toHaveBeenCalledWith("WARNING:");
        expect(c.cyan).toHaveBeenCalledWith("`ytpl-export key`");
        expect(status).toBe(false);

        c.yellow.mockClear();
        c.cyan.mockClear();
      });

      it("should resolve to false if failed to fetch playlist metadata", async () => {
        expect.assertions(2);
        api.getPlaylistMetadata.mockImplementationOnce(() => {
          throw new Error(errorQuotaExceeded);
        });

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorQuotaExceeded));
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
        c.green.mockClear();
      });

      it("should resolve to false if failed to fetch playlist data and --default is true", async () => {
        expect.assertions(2);
        api.getPlaylistData.mockImplementationOnce(() => {
          throw new Error(errorQuotaExceeded);
        });
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);

        const status = await idActionHandler(stubs.playlist.playlistId, { default: true });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorQuotaExceeded));
        expect(status).toBe(false);
      });

      it("should resolve to false if failed to fetch playlist data and --default is false", async () => {
        expect.assertions(2);
        api.getPlaylistData.mockImplementationOnce(() => {
          throw new Error(errorQuotaExceeded);
        });
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);

        const status = await idActionHandler(stubs.playlist.playlistId, { default: false });
        expect(handleApiErrorMock).toHaveBeenCalledWith(new Error(errorQuotaExceeded));
        expect(status).toBe(false);
      });
    });

    describe("resolve to true", () => {
      beforeEach(() => {
        api.getPlaylistMetadata.mockResolvedValueOnce(stubs.playlist.playlistMetadata);
        Config.prototype.getExportItemsDefaults.mockReturnValueOnce(stubs.exportItemsAll);
        api.getPlaylistData.mockResolvedValueOnce(stubs.playlist.fullJsonOutput);
      });

      afterEach(() => {
        jest.clearAllMocks();
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

  describe("handleApiError", () => {
    afterEach(() => {
      c.red.mockClear();
    });

    it("should handle quota exceeded error", () => {
      id.handleApiError(new Error(errorQuotaExceeded));
      expect(c.red.mock.calls[0][0]).toBe(
        "ERROR (403): Your API key has exceeded the daily quota of 10,000 units."
      );
      expect(c.red.mock.calls[1][0]).toBe(
        "You cannot export more data until tomorrow when the quote usage resets."
      );
    });

    it("should handle playlist not found error", () => {
      id.handleApiError(new Error(errorPlaylistNotFound));
      expect(c.red.mock.calls[0][0]).toBe("ERROR (404): Playlist cannot be found.");
      expect(c.red.mock.calls[1][0]).toBe(
        "This may be because the playlist visibility is set to private."
      );
    });

    it("should handle other unknown error types", () => {
      const error = { status: 403, reason: "forbidden" };
      id.handleApiError(new Error(JSON.stringify(error)));
      expect(c.red).toHaveBeenCalledWith(
        `ERROR (${error.status} ${error.reason}): Something went wrong. Please try again!`
      );
    });
  });
});
