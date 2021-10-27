import inquirer from "inquirer";
import Config from "../../source/lib/Config";
import keyActionHandler, * as key from "../../source/commands/key";

jest.mock("../../source/lib/Config");

describe("key command", () => {
  describe("setApiKey", () => {
    it("should set config's apiKey to trimmed inputted key", async () => {
      expect.assertions(1);
      inquirer.prompt.mockResolvedValue({ apiKey: "   lorem  " });

      await key.setApiKey();
      expect(Config.prototype.set).toHaveBeenCalledWith("apiKey", "lorem");
    });
  });

  describe("keyActionHandler", () => {
    let setApiKeyMock;
    const configGetMock = Config.prototype.get.mockReturnValue("fakeApiKey");

    beforeAll(() => {
      setApiKeyMock = jest.spyOn(key, "setApiKey").mockImplementation(() => undefined);
    });

    afterAll(() => {
      setApiKeyMock.mockRestore();
    });

    it("should run setApiKey if API key is missing", async () => {
      expect.assertions(1);
      configGetMock.mockReturnValueOnce("");

      await keyActionHandler();
      expect(setApiKeyMock).toHaveBeenCalledWith();
    });

    it("should run setApiKey if user chooses to edit key", async () => {
      expect.assertions(1);
      inquirer.prompt.mockResolvedValue({ keyAction: "editKey" });

      await keyActionHandler();
      expect(setApiKeyMock).toHaveBeenCalledWith();
    });

    it("should set API key to empty string if user chooses to delete key", async () => {
      expect.assertions(1);
      inquirer.prompt.mockResolvedValue({ keyAction: "removeKey" });

      await keyActionHandler();
      expect(Config.prototype.set).toHaveBeenCalledWith("apiKey", "");
    });

    it("should do nothing if user chooses to exit", async () => {
      expect.assertions(2);
      inquirer.prompt.mockResolvedValue({ keyAction: "exit" });

      await keyActionHandler();
      expect(Config.prototype.set).not.toHaveBeenCalled();
      expect(setApiKeyMock).not.toHaveBeenCalled();
    });
  });
});
