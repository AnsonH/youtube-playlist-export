import inquirer from "inquirer";
import Config from "../../source/lib/Config";
import keyActionHandler, * as key from "../../source/commands/key";

jest.mock("../../source/lib/Config");

describe("key commands", () => {
  let configSetMock, inquirerMock;

  beforeEach(() => {
    configSetMock = jest.spyOn(Config.prototype, "set");
    inquirerMock = jest.spyOn(inquirer, "prompt");
  });

  afterEach(() => {
    configSetMock.mockClear();
    inquirerMock.mockClear();
  });

  describe("setApiKey", () => {
    it("should set config's apiKey to trimmed inputted key", async () => {
      expect.assertions(1);
      inquirerMock.mockResolvedValue({ apiKey: "   lorem  " });

      await key.setApiKey();
      expect(configSetMock).toHaveBeenCalledWith("apiKey", "lorem");
    });
  });

  describe("keyActionHandler", () => {
    let configGetMock, setApiKeyMock;

    beforeEach(() => {
      configGetMock = jest.spyOn(Config.prototype, "get").mockReturnValue("fakeApiKey");
      setApiKeyMock = jest.spyOn(key, "setApiKey").mockImplementation(() => undefined);
    });

    afterEach(() => {
      configGetMock.mockClear();
      setApiKeyMock.mockRestore();
    });

    it("should run setApiKey if API key is missing", async () => {
      expect.assertions(1);
      configGetMock.mockReturnValue("");

      await keyActionHandler();
      expect(setApiKeyMock).toHaveBeenCalledWith();
    });

    it("should run setApiKey if user chooses to edit key", async () => {
      expect.assertions(1);
      inquirerMock.mockResolvedValue({ keyAction: "editKey" });

      await keyActionHandler();
      expect(setApiKeyMock).toHaveBeenCalledWith();
    });

    it("should set API key to empty string if user chooses to delete key", async () => {
      expect.assertions(1);
      inquirerMock.mockResolvedValue({ keyAction: "removeKey" });

      await keyActionHandler();
      expect(configSetMock).toHaveBeenCalledWith("apiKey", "");
    });

    it("should do nothing if user chooses to exit", async () => {
      expect.assertions(2);
      inquirerMock.mockResolvedValue({ keyAction: "exit" });

      await keyActionHandler();
      expect(configSetMock).not.toHaveBeenCalled();
      expect(setApiKeyMock).not.toHaveBeenCalled();
    });
  });
});
