import * as fs from "fs";
import { SpinnerLike } from "./spinner";
import EmberProject from "./ember-project";
import { ModuleSizes } from "./module";
import { BundleSizes } from "./bundle";

const DATA_VERSION = 2;

const pWriteFile = (
  contents: Buffer | string,
  fileName: string,
  options: string | fs.WriteFileOptions
): Promise<void> =>
  new Promise<void>((res, rej) => {
    fs.writeFile(fileName, contents, options, err => {
      if (err) rej(err);
      else res();
    });
  });

/**
 *
 * @beta
 */
class Stats {
  private bundleRows: [string, string, number, number, number, number][] = [];
  private moduleRows: [
    string,
    string,
    string,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ][] = [];
  private isSaved = false;
  private headers = [
    ["schema-version", DATA_VERSION],
    [
      "type",
      "bundleName",
      "moduleName",
      "size",
      "minSize",
      "gzipSize",
      "brSize",
      "bundleRatio",
      "soloGzSize",
      "soloBrSize"
    ],
    ["type", "bundleName", "size", "minSize", "gzipSize", "brSize"]
  ];
  public constructor(protected csvFileName: string) {
    this.csvFileName = csvFileName;
  }

  public addBundleRow(bundleName: string, sizes: BundleSizes): void {
    this.bundleRows.push([
      "bundle",
      bundleName,
      sizes.size,
      sizes.minSize,
      sizes.gzSize,
      sizes.brSize
    ]);
  }
  public addFileRow(
    bundleName: string,
    fileName: string,
    sizes: ModuleSizes
  ): void {
    this.moduleRows.push([
      "module",
      bundleName,
      fileName,
      sizes.size,
      sizes.minSize,
      sizes.gzSize,
      sizes.brSize,
      sizes.minifiedBundlePortion,
      sizes.individualGzSize ?? -1,
      sizes.individualBrSize ?? -1
    ]);
  }

  public async save(
    project: EmberProject,
    spinner?: SpinnerLike
  ): Promise<void> {
    if (this.isSaved)
      throw new Error(`CSV file ${this.csvFileName} is already saved`);
    this.isSaved = true;
    spinner?.start(`Saving CSV file: ${this.csvFileName}`);
    await pWriteFile(
      [
        ...this.headers,
        ...this.moduleRows.map(([, name, bundleName, ...rest]) => [
          name.replace(project.path, ""),
          bundleName.replace(project.path, ""),
          ...rest
        ]),
        ...this.bundleRows.map(([, name, ...rest]) => [
          name.replace(project.path, ""),
          ...rest
        ])
      ]
        .map(r => r.join(", "))
        .join("\n"),
      this.csvFileName,
      "utf8"
    );
    spinner?.succeedAndStart(`Saved CSV file: ${this.csvFileName}`);
  }
}

export default Stats;
