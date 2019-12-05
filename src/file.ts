import * as fs from "fs-extra";
import * as path from "path";

import { minify, gzipCompress, brotliCompress } from "./compression";
import Bundle from "./bundle";
import EmberProject from "./ember-project";

interface FileSizes {
  size: number;
  minSize: number;
  brSize: number;
  gzSize: number;

  bundlePortion: number;

  individualGzSize: number;
  individualBrSize: number;
}

/**
 * File within a bundle, within a project
 *
 * @alpha
 */
export default class File {
  public _realpath: string = path.join(this.bundle.workingDir, this.fileName);
  public contents: string = fs.readFileSync(this._realpath, "utf8");
  public fileSamplesDir: string = path.join(
    this.project.brotliOutPath,
    this._realpath.replace(this.project.projectPath, "")
  );
  private _sizes?: FileSizes;
  public get sizes(): FileSizes {
    if (!this._sizes)
      throw new Error(
        "Attempted to access file sizes before they were calculated"
      );
    return this._sizes;
  }
  public get bundlePortion(): number {
    return this.sizes.minSize / this.bundle.sizes.minSize;
  }

  /**
   * @param bundle - bundle that this file belongs to
   * @param fileName - name of this file
   * @param size - size reported by broccoli-concat-stats
   */
  public constructor(
    protected project: EmberProject,
    protected bundle: Bundle,
    public fileName: string,
    private reportedSize: number
  ) {
    fs.ensureDirSync(this.fileSamplesDir);
    const originalPath = path.join(
      this.fileSamplesDir,
      "original" + path.extname(this._realpath)
    );
    fs.writeFileSync(originalPath, this.contents, "utf8");
  }
  public get bundleName(): string {
    return this.bundle.name;
  }

  public async gatherSizes(): Promise<void> {
    const size = new Buffer(this.contents).length;
    const trimmedContents = this.contents.trim();

    // minified
    const minifiedResult =
      trimmedContents.length === 0 ? new Buffer("") : minify(trimmedContents);
    if (!minifiedResult)
      throw new Error(
        "No minified result code from: " +
          this.fileName +
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
    const bundlePct = this.sizes.minSize / this.bundle.sizes.minSize;
    this._sizes = {
      size,
      bundlePortion: bundlePct,
      brSize: this.bundle.sizes.brSize * bundlePct,
      gzSize: this.bundle.sizes.gzSize * bundlePct,
      minSize,
      individualBrSize,
      individualGzSize
    };
  }
}
