import Conf from "conf";
import * as stubs from "../stubs";
import Config, { schema } from "../../lib/Config";

jest.mock("conf");
let config; // Instance of Config

describe("config class", () => {
  beforeEach(() => {
    config = new Config();
  });

  it("should create Conf instance in constructor", () => {
    expect(Conf).toHaveBeenCalledWith({ schema });
  });

  describe("checkKey", () => {
    it("should throw error for an unknown key", () => {
      jest.spyOn(config.conf, "has").mockReturnValueOnce(false);
      expect(() => config.checkKey("foo")).toThrow("Unknown config key");
    });

    it("should not throw error for a known key", () => {
      jest.spyOn(config.conf, "has").mockReturnValueOnce(true);

      expect(() => config.checkKey("foo")).not.toThrow("Unknown config key");
    });
  });

  describe("get", () => {
    it("should get the config key value", () => {
      jest.spyOn(config, "checkKey").mockImplementationOnce(() => undefined);
      jest.spyOn(config.conf, "get").mockReturnValueOnce("foo");
      expect(config.get("foo")).toBe("foo");
    });
  });

  describe("set", () => {
    it("should set a config item", () => {
      jest.spyOn(config, "checkKey").mockImplementationOnce(() => undefined);
      config.set("foo", "bar");
      expect(config.conf.set).toHaveBeenCalledWith("foo", "bar");
    });
  });

  describe("getExportItemsDefaults", () => {
    it("should return an array of key names where key value equals to true", () => {
      jest.spyOn(config.conf, "get").mockReturnValueOnce({ ...stubs.defaultConfig.exportItems });

      const result = config.getExportItemsDefaults();
      expect(result).toStrictEqual(["position", "title", "uploader", "url"]);
    });
  });

  describe("setExportItemsDefault", () => {
    it("should set export items correctly", () => {
      jest.spyOn(config.conf, "get").mockReturnValueOnce({ ...stubs.defaultConfig.exportItems });

      const items = ["position", "publishTime"];
      config.setExportItemsDefaults(items);

      expect(config.conf.set).toHaveBeenCalledWith("exportItems", {
        position: true,
        title: false,
        uploader: false,
        uploaderUrl: false,
        url: false,
        description: false,
        videoPrivacy: false,
        publishTime: true,
      });
    });
  });

  describe("resetAll", () => {
    it("should reset all config to default", () => {
      config.resetAll();
      expect(config.conf.clear).toHaveBeenCalledWith();
    });
  });
});
