import * as fs from "fs";
import File from "./file";
import { ISpinner } from "./spinner";
import EmberProject from "./ember-project";

const DATA_VERSION = 2;

const pWriteFile = (
  contents: Buffer | string,
  fileName: string,
  options: string | fs.WriteFileOptions
) =>
  new Promise<void>((res, rej) => {
    fs.writeFile(fileName, contents, options, err => {
      if (err) rej(err);
      else res();
    });
  });

class StatsCsv {
  bundleRows: [string, string, number, number, number, number][] = [];
  moduleRows: [
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
  isSaved = false;
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
  constructor(protected csvFileName: string) {
    this.csvFileName = csvFileName;
  }

  addBundleRow(
    bundleName: string,
    sizes: Record<"brSize" | "gzSize" | "minSize" | "size", number>
  ) {
    this.bundleRows.push([
      "bundle",
      bundleName,
      sizes.size,
      sizes.minSize,
      sizes.gzSize,
      sizes.brSize
    ]);
  }
  addFileRow(
    bundleName: string,
    fileName: string,
    sizes: Record<
      "brSize" | "gzSize" | "minSize" | "size" | "bundlePortion",
      number
    > &
      Record<"individualGzSize" | "individualBrSize", number | undefined>
  ) {
    this.moduleRows.push([
      "module",
      bundleName,
      fileName,
      sizes.size,
      sizes.minSize,
      sizes.gzSize,
      sizes.brSize,
      sizes.bundlePortion,
      sizes.individualGzSize ?? -1,
      sizes.individualBrSize ?? -1
    ]);
  }

  async save(project: EmberProject, spinner?: ISpinner) {
    if (this.isSaved)
      throw new Error(`CSV file ${this.csvFileName} is already saved`);
    this.isSaved = true;
    spinner?.start(`Saving CSV file: ${this.csvFileName}`);
    await pWriteFile(
      [
        ...this.headers,
        ...this.moduleRows.map(([, name, bundleName, ...rest]) => [
          name.replace(project.projectPath, ""),
          bundleName.replace(project.projectPath, ""),
          ...rest
        ]),
        ...this.bundleRows.map(([, name, ...rest]) => [
          name.replace(project.projectPath, ""),
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

export default StatsCsv;
