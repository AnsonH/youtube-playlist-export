import Conf from "conf";
import os from "os";
import path from "path";

const schema = {
  apiKey: {
    type: "string",
    default: "",
  },
  exportItems: {
    type: "object",
    properties: {
      position: { type: "boolean" },
      title: { type: "boolean" },
      uploader: { type: "boolean" },
      uploaderUrl: { type: "boolean" },
      url: { type: "boolean" },
      description: { type: "boolean" },
      videoPrivacy: { type: "boolean" },
      publishTime: { type: "boolean" },
    },
    default: {
      position: true,
      title: true,
      uploader: true,
      uploaderUrl: false,
      url: true,
      description: false,
      videoPrivacy: false,
      publishTime: false,
    },
  },
  fileExt: {
    type: "string",
    enum: ["csv", "json"],
    default: "json",
  },
  folderPath: {
    type: "string",
    default: path.join(os.homedir(), "ytpl-export/"),
  },
  notifyUpdate: {
    type: "boolean",
    default: true,
  },
  skipPrivateOrDeleted: {
    type: "boolean",
    default: true,
  },
};

class Config {
  constructor() {
    this.conf = new Conf({ schema });
  }

  /**
   * Throw an error if the config key is not found.
   * @param {string} key  Config key
   */
  checkKey(key) {
    if (!this.conf.has(key)) {
      throw new Error("Unknown config key.");
    }
  }

  get(key) {
    this.checkKey(key);
    return this.conf.get(key);
  }

  set(key, value) {
    this.checkKey(key);
    this.conf.set(key, value);
  }

  /**
   * Used in the `default` field of `inquirer` prompt.
   * @returns {string[]}  Key names in `exportItems` if that key's value is `true`
   */
  getExportItemsDefaults() {
    const exportItems = this.conf.get("exportItems");
    const result = [];

    for (let key in exportItems) {
      if (exportItems[key]) {
        result.push(key);
      }
    }

    return result;
  }

  /**
   * Set which items to export by default.
   * @param {string[]} items Key names in `exportItems` to be set to `true`
   */
  setExportItemsDefaults(items) {
    const exportItems = this.conf.get("exportItems");

    Object.keys(exportItems).forEach((item) => {
      exportItems[item] = items.includes(item);
    });

    this.conf.set("exportItems", exportItems);
  }

  /**
   * Get the path of the config file.
   */
  get path() {
    return this.conf.path;
  }

  /**
   * Reset all items to their default value defined in `schema`.
   */
  resetAll() {
    this.conf.clear();
  }
}

export default Config;
