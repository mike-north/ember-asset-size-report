import * as fs from "fs-extra";
import * as path from "path";

import { minify, gzipCompress, brotliCompress } from "./compression";
import Bundle from "./bundle";
import EmberProject from "./ember-project";
import { BaseSize } from "./types";
/**
 * Size information pertaining to a module
 *
 * @beta
 */
export interface ModuleSizes extends BaseSize {
  /**
   * The portion of this module's bundle's size that this module is responsible for
   */
  minifiedBundlePortion: number;

  /**
   * The gzipped size of this module _when compressed individually_
   */
  individualGzSize: number;
  /**
   * The brotli'd size of this module _when compressed individually_
   */
  individualBrSize: number;
}

/**
 * File within a bundle, within a project
 *
 * @beta
 */
export default class Module {
  private _realpath: string;
  /**
   * The contents of this module
   */
  public contents: string;
  /**
   * The folder in which "specimens" (minified and compressed variants of the file) will be written
   */
  private fileSamplesDir: string;
  private _sizes?: ModuleSizes;

  /**
   * Size information pertaining to this module
   */
  public get sizes(): ModuleSizes {
    if (!this._sizes)
      throw new Error(
        "Attempted to access file sizes before they were calculated"
      );
    return this._sizes;
  }
  /**
   * The percentage of size that this module contributes to its minified bundle
   */
  public get minifiedBundlePortion(): number {
    return this.sizes.minSize / this.bundle.sizes.minSize;
  }

  /**
   * @param bundle - bundle that this file belongs to
   * @param name - name of this file
   * @param reportedSize - size reported by broccoli-concat-stats
   */
  public constructor(
    /**
     * The bundle that this module belongs to
     */
    public readonly bundle: Bundle,
    /**
     * This module's name
     */
    public readonly name: string,
    private reportedSize: number
  ) {
    this._realpath = path.join(this.bundle.workingDir, this.name);
    this.contents = fs.readFileSync(this._realpath, "utf8");
    this.fileSamplesDir = path.join(
      this.bundle.project.brotliOutPath,
      this._realpath.replace(this.bundle.project.path, "")
    );
    fs.ensureDirSync(this.fileSamplesDir);
    const originalPath = path.join(
      this.fileSamplesDir,
      "original" + path.extname(this._realpath)
    );
    fs.writeFileSync(originalPath, this.contents, "utf8");
  }

  /**
   * Determinze size information for this module
   * @internal
   */
  public async calculateSizes(bundleSizes: BaseSize): Promise<void> {
    const size = new Buffer(this.contents).length;
    const trimmedContents = this.contents.trim();

    // minified
    const minifiedResult =
      trimmedContents.length === 0 ? new Buffer("") : minify(trimmedContents);
    if (!minifiedResult)
      throw new Error(
        "No minified result code from: " +
          this.name +
          "\n---" +
          trimmedContents +
          "\n---"
      );

    const minSize = Buffer.byteLength(minifiedResult);

    // gzip
    const pGzippedContents = gzipCompress(minifiedResult);
    // brotli
    const pBrotliContents = brotliCompress(minifiedResult);

    const [gzippedContents, brotliContents] = await Promise.all([
      pGzippedContents,
      pBrotliContents
    ]);
    const individualGzSize = Buffer.byteLength(gzippedContents);
    const individualBrSize = Buffer.byteLength(gzippedContents);
    // minified
    const minifiedPath = path.join(
      this.fileSamplesDir,
      "min" + path.extname(this._realpath)
    );
    fs.writeFileSync(minifiedPath, minifiedResult, "utf8");
    // gzip
    const gzPath = path.join(
      this.fileSamplesDir,
      "min.gz" + path.extname(this._realpath)
    );
    fs.writeFileSync(gzPath, gzippedContents, "utf8");
    // brotli
    const brPath = path.join(
      this.fileSamplesDir,
      "min.br" + path.extname(this._realpath)
    );
    fs.writeFileSync(brPath, brotliContents, "utf8");
    const bundlePct = minSize / bundleSizes.minSize;
    this._sizes = {
      size,
      minifiedBundlePortion: bundlePct,
      brSize: bundleSizes.brSize * bundlePct,
      gzSize: bundleSizes.gzSize * bundlePct,
      minSize,
      individualBrSize,
      individualGzSize
    };
  }
}
