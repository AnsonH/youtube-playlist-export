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
    default: path.join(os.homedir(), "ytpl-export/"), // Export to ~/ytpl-export/ folder by default
  },
};

class Config {
  constructor() {
    this.conf = new Conf({ schema });
  }

  get apiKey() {
    return this.conf.get("apiKey");
  }

  set apiKey(newKey) {
    this.conf.set("apiKey", newKey);
  }

  removeApiKey() {
    this.conf.reset("apiKey");
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

  get fileExt() {
    return this.conf.get("fileExt");
  }

  set fileExt(newFileExt) {
    this.conf.set("fileExt", newFileExt);
  }

  get folderPath() {
    return this.conf.get("folderPath");
  }

  set folderPath(newPath) {
    this.conf.set("folderPath", newPath);
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
