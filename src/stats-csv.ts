import * as fs from "fs";
import { SpinnerLike } from "./spinner";
import EmberProject from "./ember-project";
import { ModuleSizes } from "./module";
import { BundleSizes } from "./bundle";

const DATA_VERSION = 3;

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
 * Stats data store
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
      "dataset",
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
    ["type", "dataset", "bundleName", "size", "minSize", "gzipSize", "brSize"]
  ];
  private readonly appendData: boolean;
  public constructor(
    /**
     * Name of the CSV file
     */
    private csvFileName: string,
    /**
     * Name of the dataset
     */
    private dataSetName: string,
    options?: { append?: boolean }
  ) {
    this.appendData = options?.append ?? true;
  }

  /**
   * Add a bundle's size information to the data set
   * @param bundleName - name of the bundle
   * @param sizes - bundle asset sizes
   */
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
  /**
   * Add a module's size information to the data set
   * @param bundleName - name of the bundle that this module belongs to
   * @param fileName - name of this module
   * @param sizes - size information for this bundle
   */
  public addModuleRow(
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

  /**
   * Save this data set as a CSV file
   * @param project - ember-cli project
   * @param spinner - optional loading spinner
   */
  public async save(
    project: EmberProject,
    spinner?: SpinnerLike
  ): Promise<void> {
    if (this.isSaved)
      throw new Error(`CSV file ${this.csvFileName} is already saved`);
    this.isSaved = true;
    spinner?.start(`Saving CSV file: ${this.csvFileName}`);
    const exists = fs.existsSync(this.csvFileName);
    await pWriteFile(
      [
        ...(exists ? [] : this.headers),
        ...this.moduleRows.map(([typ, name, bundleName, ...rest]) => [
          typ,
          this.dataSetName,
          name.replace(project.path, ""),
          bundleName.replace(project.path, ""),
          ...rest
        ]),
        ...this.bundleRows.map(([typ, name, ...rest]) => [
          typ,
          this.dataSetName,
          name.replace(project.path, ""),
          ...rest
        ])
      ]
        .map(r => r.join(", "))
        .join("\n"),
      this.csvFileName,
      {
        encoding: "utf8",
        flag: this.appendData ? "a" : "w"
      }
    );
    spinner?.succeedAndStart(`Saved CSV file: ${this.csvFileName}`);
  }
}

export default Stats;
