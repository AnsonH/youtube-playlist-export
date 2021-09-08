import Conf from "conf";

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
      description: { type: "boolean" },
      url: { type: "boolean" },
    },
    default: {
      position: true,
      title: true,
      uploader: true,
      uploaderUrl: false,
      description: false,
      url: true,
    },
  },
};

class Config {
  constructor() {
    this.conf = new Conf({ schema });
  }

  get apiKey() {
    const key = this.conf.get("apiKey");
    return key;
  }

  set apiKey(newKey) {
    this.conf.set("apiKey", newKey);
  }

  removeApiKey() {
    this.conf.delete("apiKey");
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
