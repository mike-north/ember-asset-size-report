// @ts-check
"use strict";

import * as fs from "fs-extra";
import * as path from "path";

import { BROT_OUT_DIR, PROJECT_PATH } from "./paths";

import { minify } from "./compression";
import Bundle from "./bundle";

export default class File {
  _realpath: string;
  minSize: number = 0;
  contents: string;
  fileSamplesDir: string;
  /**
   *
   * @param  bundle
   * @param  fileName
   * @param  size
   */
  constructor(
    protected bundle: Bundle,
    public fileName: string,
    public size: number = 0
  ) {
    this._realpath = path.join(bundle.workingDir, fileName);

    this.minSize = 0;

    this.contents = fs.readFileSync(this._realpath, "utf8");
    this.fileSamplesDir = path.join(
      BROT_OUT_DIR,
      this._realpath.replace(PROJECT_PATH, "")
    );
    fs.ensureDirSync(this.fileSamplesDir);
    if (process.env.WRITE_MODULE_VARIANTS) {
      const originalPath = path.join(
        this.fileSamplesDir,
        "original" + path.extname(this._realpath)
      );
      fs.writeFileSync(originalPath, this.contents, "utf8");
    }
  }

  async gatherMinifiedSize() {
    let minifiedResult = minify(this.contents);
    if (!minifiedResult)
      throw new Error("No minified result code from " + this.contents);
    this.minSize = Buffer.byteLength(minifiedResult);
    if (process.env.WRITE_MODULE_VARIANTS) {
      const minifiedPath = path.join(
        this.fileSamplesDir,
        "minified.min" + path.extname(this._realpath)
      );
      fs.writeFileSync(minifiedPath, minifiedResult, "utf8");
    }
  }

  get brSize() {
    let percentageOfBundle = this.minSize / this.bundle.minSize;

    return this.bundle.brSize * percentageOfBundle;
  }
  get gzSize() {
    let percentageOfBundle = this.minSize / this.bundle.minSize;

    return this.bundle.gzSize * percentageOfBundle;
  }
}
