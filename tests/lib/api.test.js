import axios from "axios";
import chalk from "chalk";
import MockAdapter from "axios-mock-adapter";
import * as stubs from "../stubs";
import { API_BASE_URL, throwError, validateApiKey } from "../../lib/api";

const mock = new MockAdapter(axios);
const fakeApiKey = "fakeKey";

describe("api", () => {
  beforeEach(() => {
    mock.reset();
  });

  describe("validateApiKey", () => {
    it("should check for empty API key", async () => {
      expect.assertions(1);
      await validateApiKey("");
      expect(chalk.red).toHaveBeenCalledWith("Please enter a non-empty API key");
    });

    it("should return true if API call succeeds", async () => {
      expect.assertions(1);

      mock.onGet(`${API_BASE_URL}/playlistItems`).reply(200);

      const result = await validateApiKey(fakeApiKey);
      expect(result).toBe(true);
    });

    it("should handle network error", async () => {
      expect.assertions(1);

      mock.onGet(`${API_BASE_URL}/playlistItems`).networkErrorOnce();
      await validateApiKey(fakeApiKey);

      expect(chalk.red).toHaveBeenCalledWith(
        "Error in network connection. Please check your Internet connection."
      );
    });

    it("should handle invalid API key", async () => {
      expect.assertions(1);

      mock.onGet(`${API_BASE_URL}/playlistItems`).reply(400);
      await validateApiKey(fakeApiKey);

      expect(chalk.red).toHaveBeenCalledWith(
        "Your API key is invalid. Did you obtain the API key correctly?\n" +
          // prettier-ignore
          `Watch this 3 min. tutorial on how to get a YouTube API key (v3) - ${chalk.underline("https://youtu.be/N18czV5tj5o")}`
      );
    });

    it("should handle error status other than 400", async () => {
      expect.assertions(1);

      mock.onGet(`${API_BASE_URL}/playlistItems`).reply(403);
      await validateApiKey(fakeApiKey);

      expect(chalk.red).toHaveBeenCalledWith("Your API key is not working. Please try again.");
    });
  });

  describe("throwError", () => {
    it("should throw a stringified custom error object", () => {
      const error = {
        status: 404,
        reason: "playlistNotFound",
      };
      const axiosError = stubs.axiosErrorResponse(error.status, error.reason);
      expect(() => throwError(axiosError)).toThrow(JSON.stringify(error));
    });
  });
});
