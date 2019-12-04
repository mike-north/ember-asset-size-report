import * as fs from "fs-extra";
import * as path from "path";
import { BROT_OUT_DIR } from "./paths";
import { SPIN, spinnerSucceedAndStart } from "./spinner";
import { minify, brotliCompress, gzipCompress } from "./compression";
import { toKB } from "./formatting";
import File from "./file";
import StatsCsv from "./stats-csv";

/**
 * Asset size stats relating to a specific client-side JS bundle
 */
class Bundle {
  workingDir: string;
  statsPath: string;
  minSize: number = 0;
  _minifiedSize?: number;
  brSize: number = 0;
  gzSize: number = 0;
  statsFileContents: any;
  bundleFiles: File[] = [];
  _hasGathered = false;
  /**
   * @param statsFolder path to the concat-stats folder
   * @param bundleName bundle filename
   */
  constructor(statsFolder: string, public bundleName: string) {
    this.statsPath = path.join(statsFolder, bundleName);

    // strip trailing .json extension
    this.workingDir = this.statsPath.slice(0, -5);

    // read the stats data
    this.statsFileContents = fs.readJsonSync(this.statsPath);

    for (let fileName in this.statsFileContents.sizes) {
      this.bundleFiles.push(
        new File(this, fileName, this.statsFileContents.sizes[fileName])
      );
    }

    this.minSize = 0;
    this.brSize = 0;
  }

  /**
   * The contents of the entire bundle
   */
  get contents() {
    return this.bundleFiles.map(f => f.contents).join(";\n");
  }

  /**
   * Determine the minified sizes of all of the files within the bundle,
   * such that the summation of the bundle's contents add up to the total
   * size of the bundle.
   */
  async calculateMinifiedSizes() {
    if (this._hasGathered) {
      // don't re-run
      return;
    }
    SPIN.text += " - measuring overall bundle size";
    SPIN.render();
    const resultDir = path.join(BROT_OUT_DIR, "bundles", this.bundleName);

    if (process.env.WRITE_MODULE_VARIANTS) {
      // write "original" asset
      fs.ensureDirSync(resultDir);
      const originalFilePath = path.join(
        resultDir,
        "original" + path.extname(this.bundleName.replace(".json", ""))
      );
      fs.writeFileSync(originalFilePath, this.contents, "utf8");
      SPIN.info(
        `Original - ${originalFilePath} (${toKB(
          fs.statSync(originalFilePath).size
        )} KB)`
      ).start();
    }
    let minifiedResult = minify(this.contents);
    if (!minifiedResult)
      throw new Error("No minified result code from " + this.contents);

    this._minifiedSize = Buffer.byteLength(minifiedResult);
    if (process.env.WRITE_MODULE_VARIANTS) {
      // write "minified" asset
      const minFilePath = path.join(
        resultDir,
        "minified.min" + path.extname(this.bundleName.replace(".json", ""))
      );
      fs.writeFileSync(minFilePath, minifiedResult, "utf8");
      SPIN.info(
        `Minified - ${minFilePath} (${toKB(fs.statSync(minFilePath).size)} KB)`
      ).start();
    }
    SPIN.succeed(
      `Gathering minified bundle sizes: measured bundle (${toKB(
        this._minifiedSize
      )}Kb)`
    ).start("Gathering minified bundle sizes: measuring individual files...");

    SPIN.text = `Gathering minified bundle sizes: measuring individual files...${this.bundleName}`;
    let gzResult = await gzipCompress(minifiedResult);
    this.gzSize = Buffer.byteLength(gzResult);
    if (process.env.WRITE_MODULE_VARIANTS) {
      const gzFilePath = path.join(
        resultDir,
        "compressed.gz" + path.extname(this.bundleName.replace(".json", ""))
      );
      fs.writeFileSync(gzFilePath, gzResult, "utf8");
      SPIN.info(
        `Gzip - ${gzFilePath} (${toKB(fs.statSync(gzFilePath).size)} KB)`
      ).start();
    }

    let brResult = await brotliCompress(minifiedResult);
    this.brSize = Buffer.byteLength(brResult);
    if (process.env.WRITE_MODULE_VARIANTS) {
      const brFilePath = path.join(
        resultDir,
        "compressed.br" + path.extname(this.bundleName.replace(".json", ""))
      );
      fs.writeFileSync(brFilePath, brResult, "utf8");
      SPIN.info(
        `Brotli ${brFilePath} (${toKB(fs.statSync(brFilePath).size)} KB)`
      ).start();
    }
    SPIN.start(
      `Gathering minified bundle sizes: measuring individual files...`
    );
    for (let file of this.bundleFiles) {
      let oldtxt = SPIN.text;
      SPIN.text += file.fileName;
      SPIN.render();
      await file.gatherMinifiedSize();
      SPIN.text = oldtxt;
    }

    this.minSize = this.bundleFiles.reduce(
      (total, file) => (total += file.minSize),
      0
    );
    this._hasGathered = true;
    this._minifiedSize = Buffer.byteLength(minifiedResult);
    spinnerSucceedAndStart(
      `Gathering minified bundle sizes: measured minified bundle (${toKB(
        this.minSize
      )}Kb)`
    );
  }

  async addFile(file: File) {
    this.bundleFiles.push(file);
  }
  async prepareCSV(file: StatsCsv) {
    SPIN.start("Gathering minified bundle sizes");
    await this.calculateMinifiedSizes();
    SPIN.succeed("Gathered minified bundle sizes");
    this.bundleFiles.forEach(f => file.addRow(f.fileName, f));
  }
}

export default Bundle;
