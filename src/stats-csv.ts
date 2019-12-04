import * as fs from "fs";
import { PROJECT_PATH } from "./paths";
import { SPIN, spinnerSucceedAndStart } from "./spinner";
import File from "./file";

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
  rows: [string, number, number, number, number][] = [];
  isSaved = false;
  constructor(protected csvFileName: string, protected headers: string[]) {
    this.csvFileName = csvFileName;
    this.headers = headers;
    /**
     * @type {[string, number, number, number, number][]}
     */
  }

  addRow(
    fileName: string,
    sizes: Pick<File, "brSize" | "gzSize" | "minSize" | "size">
  ) {
    this.rows.push([
      fileName,
      sizes.size,
      sizes.minSize,
      sizes.gzSize,
      sizes.brSize
    ]);
  }

  async save() {
    if (this.isSaved)
      throw new Error(`CSV file ${this.csvFileName} is already saved`);
    this.isSaved = true;
    SPIN.start(`Saving CSV file: ${this.csvFileName}`);
    await pWriteFile(
      [
        this.headers,
        ...this.rows.map(([name, ...rest]) => [
          name.replace(PROJECT_PATH, ""),
          ...rest
        ])
      ]
        .map(r => r.join(", "))
        .join("\n"),
      this.csvFileName,
      "utf8"
    );
    spinnerSucceedAndStart(`Saved CSV file: ${this.csvFileName}`);
  }
}

export default StatsCsv;
