import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import { brotliCompress, gzipCompress, minify } from "./compression";
import EmberProject from "./ember-project";
import { sizeSummaryString } from "./formatting";
import Module from "./module";
import { SpinnerLike } from "./spinner";
import Stats from "./stats-csv";
import { BaseSize } from "./types";

/**
 * @internal
 */
class BundleStats {
  /**
   * @internal
   */
  public contents = fs.readJsonSync(
    path.join(this.project.concatStatsPath, this.bundleName)
  );
  /**
   * Create a new bundle stats object
   * @param project ember-cli project
   * @param bundleName name of the bundle that these stats pertain to
   *
   * @beta
   */
  public constructor(
    private project: EmberProject,
    private bundleName: string
  ) {}

  /**
   * Get module size information for the contents
   * of this bundle
   *
   * @beta
   */
  public get sizes(): { [k: string]: number } {
    return this.contents.sizes;
  }
}

/**
 * Size information pertaining to a bundle
 * @beta
 */
export interface BundleSizes extends BaseSize {
  /**
   * @internal
   */
  sum: number;
  /**
   * @internal
   */
  minSum: number;
  /**
   * @internal
   */
  gzSum: number;
  /**
   * @internal
   */
  brSum: number;
}

/**
 * Asset size stats relating to a specific client-side JS bundle
 *
 * @beta
 */
class Bundle {
  private stats = new BundleStats(this.project, this.bundleName);

  /**
   * @internal
   */
  public workingDir: string = path.join(
    this.project.concatStatsPath,
    this.bundleName.slice(0, -5)
  );
  private bundleFiles: Module[] = Object.keys(this.stats.sizes).map(
    fileName => new Module(this, fileName, this.stats.sizes[fileName])
  );

  private _sizes?: BundleSizes;

  /**
   * Create a new bundle
   *
   * @param project - ember-cli project
   * @param bundleName - bundle filename
   */
  public constructor(
    /**
     * The project that this bundle belongs to
     */
    public readonly project: EmberProject,
    /**
     * This bundle's raw name
     */
    private readonly bundleName: string
  ) {}
  /**
   * Size information pertaining to this bundle
   */
  public get sizes(): BundleSizes {
    if (!this._sizes)
      throw new Error(
        "Attempted to access bundle sizes before they were calculated"
      );
    return this._sizes;
  }
  /**
   * The name of this bundle
   */
  public get name(): string {
    return this.bundleName.split(/^[0-9]+-/)[1].replace(".json", "");
  }

  private get spinner(): SpinnerLike | undefined {
    return this.project.spinner;
  }

  /**
   * The contents of the entire bundle
   */
  public get contents(): string {
    return this.bundleFiles.map(f => f.contents).join(";\n");
  }

  /**
   * Determine the sizes of all of the files within the bundle,
   * such that the summation of the bundle's contents add up to the total
   * size of the bundle.
   */
  public async calculateSizes(): Promise<void> {
    if (this._sizes) {
      // don't re-run
      return;
    }

    if (this.spinner) this.spinner.text += " - measuring overall bundle size";
    this.spinner?.render();

    const bundleResultsDir = path.join(
      this.project.brotliOutPath,
      "bundles",
      this.bundleName
    );

    // write "original" asset
    fs.ensureDirSync(bundleResultsDir);
    const originalFilePath = path.join(
      bundleResultsDir,
      "original" + path.extname(this.name)
    );

    fs.writeFileSync(originalFilePath, this.contents, "utf8");
    const size = fs.statSync(originalFilePath).size;

    const minifiedResult = minify(this.contents);
    if (!minifiedResult)
      throw new Error("No minified result code from " + this.contents);

    const minSize = Buffer.byteLength(minifiedResult);
    // write "minified" asset
    const minFilePath = path.join(
      bundleResultsDir,
      "minified.min" + path.extname(this.name)
    );
    fs.writeFileSync(minFilePath, minifiedResult, "utf8");

    if (this.spinner)
      this.spinner.text = `Gathering minified bundle sizes: measuring individual files...${chalk.cyan(
        this.name
      )}`;
    const gzResult = await gzipCompress(minifiedResult);
    const gzSize = Buffer.byteLength(gzResult);
    const gzFilePath = path.join(
      bundleResultsDir,
      "compressed.gz" + path.extname(this.name)
    );
    fs.writeFileSync(gzFilePath, gzResult, "utf8");

    const brResult = await brotliCompress(minifiedResult);
    const brSize = Buffer.byteLength(brResult);
    const brFilePath = path.join(
      bundleResultsDir,
      "compressed.br" + path.extname(this.name)
    );
    fs.writeFileSync(brFilePath, brResult, "utf8");

    const sizes = {
      gzSize,
      minSize,
      size,
      brSize
    };
    await Promise.all(
      this.bundleFiles.map(async file => {
        if (this.spinner)
          `Gathering minified bundle sizes: measuring individual files within ${chalk.cyan(
            this.name
          )} - ${chalk.blue(file.name)}`;
        this.spinner?.render();
        try {
          await file.calculateSizes(sizes);
        } catch (e) {
          console.error(
            "Problem gathering minified size of file: " +
              file.name +
              "\n" +
              e +
              "\n" +
              (e instanceof Error ? e.stack : "")
          );
        }
      })
    );

    const sums = this.bundleFiles.reduce(
      ({ sum, minSum, brSum, gzSum }, file) => {
        return {
          sum: sum + file.sizes.size,
          minSum: minSum + file.sizes.minSize,
          brSum: brSum + file.sizes.brSize,
          gzSum: gzSum + file.sizes.gzSize
        };
      },
      {
        sum: 0,
        minSum: 0,
        gzSum: 0,
        brSum: 0
      }
    );
    this._sizes = {
      ...sizes,
      ...sums
    };
    this.spinner?.succeedAndStart(
      `Gathering minified bundle sizes: ${chalk.cyan(this.name)}
${sizeSummaryString(this._sizes)}`
    );
  }

  /**
   * Explicitly add a file to this bundle
   *
   * @param file - file to add to the bundle
   *
   * @beta
   */
  public addFile(file: Module): void {
    this.bundleFiles.push(file);
  }
  /**
   * Prepare a stats report with asset size data pertaining to this module
   * @param data - stats report
   *
   * @beta
   */
  public async prepareStats(data: Stats): Promise<void> {
    this.spinner?.start("Gathering minified bundle sizes");
    await this.calculateSizes();
    if (!this._sizes) throw new Error("Bundle sizes could not be calculated");
    this.spinner?.succeed("Gathered minified bundle sizes");
    this.bundleFiles.forEach(f =>
      data.addFileRow(f.bundle.name, f.name, f.sizes)
    );
    data.addBundleRow(this.name, this._sizes);
  }
}

export default Bundle;
