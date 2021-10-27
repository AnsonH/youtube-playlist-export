import axios from "axios";
import chalk from "chalk";
import MockAdapter from "axios-mock-adapter";
import * as stubs from "../stubs";
import * as api from "../../source/lib/api";
import Config from "../../source/lib/Config";

const axiosMock = new MockAdapter(axios);

jest.mock("../../source/lib/Config");

describe("api", () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe("validateApiKey", () => {
    it("should check for empty API key", async () => {
      expect.assertions(1);
      await api.validateApiKey("");
      expect(chalk.red).toHaveBeenCalledWith("Please enter a non-empty API key");
    });

    it("should return true if API call succeeds", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).reply(200);

      const result = await api.validateApiKey("fakeApiKey");
      expect(result).toBe(true);
    });

    it("should handle network error", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).networkError();
      await api.validateApiKey("fakeApiKey");

      expect(chalk.red).toHaveBeenCalledWith(
        "Error in network connection. Please check your Internet connection."
      );
    });

    it("should handle invalid API key", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).reply(400);
      await api.validateApiKey("fakeApiKey");

      expect(chalk.red).toHaveBeenCalledWith(
        "Your API key is invalid. Did you obtain the API key correctly?\n" +
          // prettier-ignore
          `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${chalk.underline("https://youtu.be/N18czV5tj5o")}`
      );
    });

    it("should handle error status other than 400", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).reply(403);
      await api.validateApiKey("fakeApiKey");

      expect(chalk.red).toHaveBeenCalledWith("Your API key is not working. Please try again.");
    });
  });

  describe("getPlaylistMetadata", () => {
    it("should fetch playlist title and no. of videos", async () => {
      expect.assertions(1);

      axiosMock
        .onGet(`${api.API_BASE_URL}/playlistItems`)
        .reply(200, stubs.playlist.playlistItemsData);
      axiosMock.onGet(`${api.API_BASE_URL}/playlists`).reply(200, stubs.playlist.playlistsData);

      const metadata = await api.getPlaylistMetadata(stubs.playlist.playlistId);

      expect(metadata).toStrictEqual({
        title: "My Fake Playlist",
        numOfVideos: 3,
      });
    });

    it("should throw error if playlistId is invalid", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).reply(404);
      const throwErrorMock = jest.spyOn(api, "throwError").mockImplementation(() => undefined);

      await api.getPlaylistMetadata("lorem");
      expect(api.throwError).toHaveBeenCalledTimes(1);

      throwErrorMock.mockRestore();
    });
  });

  describe("getPlaylistData", () => {
    it("should skip private/deleted videos if skipPrivateOrDeleted is true", async () => {
      expect.assertions(1);

      axiosMock
        .onGet(`${api.API_BASE_URL}/playlistItems`)
        .reply(200, stubs.playlist.playlistItemsData);

      Config.prototype.get.mockImplementation((key) =>
        key === "skipPrivateOrDeleted" ? true : ""
      );

      const data = await api.getPlaylistData(
        "PL12345678",
        stubs.exportItemsAll,
        stubs.playlist.playlistItemsData.pageInfo.totalResults
      );
      expect(data).toStrictEqual([stubs.playlist.fullJsonOutput[0]]);
    });

    it("should export private/deleted videos if skipPrivateOrDeleted is false", async () => {
      expect.assertions(1);

      axiosMock
        .onGet(`${api.API_BASE_URL}/playlistItems`)
        .reply(200, stubs.playlist.playlistItemsData);

      Config.prototype.get.mockImplementation((key) =>
        key === "skipPrivateOrDeleted" ? false : ""
      );

      const data = await api.getPlaylistData(
        "PL12345678",
        stubs.exportItemsAll,
        stubs.playlist.numOfVideos
      );
      expect(data).toStrictEqual(stubs.playlist.fullJsonOutput);
    });

    it("should throw error if playlistId is invalid", async () => {
      expect.assertions(1);

      axiosMock.onGet(`${api.API_BASE_URL}/playlistItems`).reply(404);
      const throwErrorMock = jest.spyOn(api, "throwError").mockImplementation(() => undefined);

      await api.getPlaylistData("PL12345678", stubs.exportItemsAll, stubs.playlist.numOfVideos);
      expect(api.throwError).toHaveBeenCalledTimes(1);

      throwErrorMock.mockRestore();
    });
  });

  describe("throwError", () => {
    it("should throw a stringified custom error object", () => {
      const error = {
        status: 404,
        reason: "playlistNotFound",
      };
      const axiosError = stubs.axiosErrorResponse(error.status, error.reason);
      expect(() => api.throwError(axiosError)).toThrow(JSON.stringify(error));
    });
  });
});
