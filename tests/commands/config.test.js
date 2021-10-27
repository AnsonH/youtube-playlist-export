import c from "chalk";
import inquirer from "inquirer";
import Config from "../../source/lib/Config";
import configActionHandler, * as cf from "../../source/commands/config";

jest.mock("../../source/lib/Config");

describe("config command", () => {
  let configSetMock;

  beforeEach(() => {
    configSetMock = jest.spyOn(Config.prototype, "set");
  });

  afterEach(() => {
    configSetMock.mockClear();
    inquirer.prompt.mockClear();
  });

  describe("configActionHandler", () => {
    let editExportOptionsMock, editNotifyUpdateMock, skipPrivateOrDeletedMock;

    beforeEach(() => {
      editExportOptionsMock = jest.spyOn(cf, "editExportOptions").mockImplementation(() => null);
      editNotifyUpdateMock = jest.spyOn(cf, "editNotifyUpdate").mockImplementation(() => null);
      skipPrivateOrDeletedMock = jest
        .spyOn(cf, "editSkipPrivateOrDeleted")
        .mockImplementation(() => null);
    });

    afterEach(() => {
      editExportOptionsMock.mockRestore();
      editNotifyUpdateMock.mockRestore();
      skipPrivateOrDeletedMock.mockRestore();
    });

    it("should log config file path and return if specified so", async () => {
      expect.assertions(4);
      const consoleLogMock = jest.spyOn(console, "log").mockImplementation((msg) => msg);

      await configActionHandler({ path: true, reset: false });
      expect(consoleLogMock).toHaveBeenCalledWith(`Path of config file: ${c.cyan(undefined)}`);
      expect(editExportOptionsMock).not.toHaveBeenCalled();
      expect(editNotifyUpdateMock).not.toHaveBeenCalled();
      expect(skipPrivateOrDeletedMock).not.toHaveBeenCalled();
      consoleLogMock.mockClear();
    });

    it("should reset config and return if specified so", async () => {
      expect.assertions(4);
      const resetConfigMock = jest.spyOn(cf, "resetConfig").mockImplementation(() => null);

      await configActionHandler({ path: false, reset: true });
      expect(resetConfigMock).toHaveBeenCalledWith();
      expect(editExportOptionsMock).not.toHaveBeenCalled();
      expect(editNotifyUpdateMock).not.toHaveBeenCalled();
      expect(skipPrivateOrDeletedMock).not.toHaveBeenCalled();
      resetConfigMock.mockRestore();
    });

    it("should return immediately if user chooses Exit", async () => {
      expect.assertions(3);
      inquirer.prompt.mockResolvedValue({ configItem: "exit" });

      await configActionHandler({ path: false, reset: false });
      expect(editExportOptionsMock).not.toHaveBeenCalled();
      expect(editNotifyUpdateMock).not.toHaveBeenCalled();
      expect(skipPrivateOrDeletedMock).not.toHaveBeenCalled();
    });

    it("should run editExportOptions, notifyUpdate, and skipPrivateOrDeleted if user chooses to edit each in order", async () => {
      expect.assertions(3);
      inquirer.prompt
        .mockResolvedValueOnce({ configItem: "exportOptions" })
        .mockResolvedValueOnce({ configItem: "notifyUpdate" })
        .mockResolvedValueOnce({ configItem: "skipPrivateOrDeleted" })
        .mockResolvedValueOnce({ configItem: "exit" });

      await configActionHandler({ path: false, reset: false });
      expect(editExportOptionsMock).toHaveBeenCalledWith();
      expect(editNotifyUpdateMock).toHaveBeenCalledWith();
      expect(skipPrivateOrDeletedMock).toHaveBeenCalledWith();
    });
  });

  describe("editExportOptions", () => {
    it("should set default export options based on prompt response", async () => {
      expect.assertions(5);
      const configSetDefaultsMock = jest.spyOn(Config.prototype, "setExportItemsDefaults");
      const promptResponse = {
        exportItems: ["position", "title"],
        fileExt: "json",
        folderPath: "/foo/bar",
      };
      inquirer.prompt.mockResolvedValue(promptResponse);

      await cf.editExportOptions();
      expect(configSetDefaultsMock).toHaveBeenCalledWith(promptResponse.exportItems);
      expect(configSetMock.mock.calls[0][0]).toBe("fileExt");
      expect(configSetMock.mock.calls[0][1]).toBe(promptResponse.fileExt);
      expect(configSetMock.mock.calls[1][0]).toBe("folderPath");
      expect(configSetMock.mock.calls[1][1]).toBe(promptResponse.folderPath);
      configSetDefaultsMock.mockClear();
    });
  });

  describe("editNotifyUpdate", () => {
    it("should set notifyUpdate option based on user response", async () => {
      expect.assertions(1);
      const promptResponse = { notifyUpdate: true };
      inquirer.prompt.mockResolvedValue(promptResponse);

      await cf.editNotifyUpdate();
      expect(configSetMock).toHaveBeenCalledWith("notifyUpdate", promptResponse.notifyUpdate);
    });
  });

  describe("editSkipPrivateOrDeleted", () => {
    it("should set skipPrivateOrDeleted option based on user response", async () => {
      expect.assertions(1);
      const promptResponse = { skipPrivateOrDeleted: true };
      inquirer.prompt.mockResolvedValue(promptResponse);

      await cf.editSkipPrivateOrDeleted();
      expect(configSetMock).toHaveBeenCalledWith(
        "skipPrivateOrDeleted",
        promptResponse.skipPrivateOrDeleted
      );
    });
  });

  describe("resetConfig", () => {
    let configResetAllMock;

    beforeEach(() => {
      configResetAllMock = jest
        .spyOn(Config.prototype, "resetAll")
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      configResetAllMock.mockClear();
    });

    it("should reset all config if specified yes", async () => {
      expect.assertions(1);
      inquirer.prompt.mockResolvedValue({ resetConfig: true });

      await cf.resetConfig();
      expect(configResetAllMock).toHaveBeenCalledWith();
    });

    it("should not reset all config if specified no", async () => {
      expect.assertions(1);
      inquirer.prompt.mockResolvedValue({ resetConfig: false });

      await cf.resetConfig();
      expect(configResetAllMock).not.toHaveBeenCalled();
    });
  });
});
