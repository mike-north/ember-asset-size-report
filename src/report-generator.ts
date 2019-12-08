import chalk from "chalk";
import * as fs from "fs";
import Bundle from "./bundle";
import { brotliCompress, gzipCompress } from "./compression";
import EmberProject from "./ember-project";
import { toKB } from "./formatting";
import { SpinnerLike } from "./spinner";
import Stats from "./stats-csv";

/**
 * Report generation utility
 *
 * @beta
 */
class ReportGenerator {
  public constructor(
    private project: EmberProject,
    private reportPath: string,
    private datasetName: string
  ) {}

  /**
   * Save the report to disk
   */
  public async save(): Promise<void> {
    await this.csv.save(this.project);
  }
  // create a container to hold Csv data
  private csv = new Stats(this.reportPath, this.datasetName);

  private get spinner(): SpinnerLike | undefined {
    return this.project.spinner;
  }
  /**
   * Add asset size data relating to a file within the ./public folder, to the
   * csv container
   *
   * @beta
   */
  public async addPublicFile(assetPath: string): Promise<void> {
    this.spinner?.start(
      `determining bundle size of 'public' asset: ${assetPath}`
    );
    const { size: minSize } = fs.statSync(assetPath);
    const en_US = fs.readFileSync(assetPath);
    const brSize = Buffer.byteLength(await brotliCompress(en_US));
    const gzSize = Buffer.byteLength(await gzipCompress(en_US, { level: 9 }));
    const minifiedBundlePortion = 1;
    this.spinner?.succeedAndStart(
      `determined size of extra JS asset: ${assetPath}: ${chalk.yellow(
        `${toKB(brSize)} KB min+br`
      )}`
    );
    this.csv.addModuleRow(assetPath, assetPath, {
      size: 0,
      minSize,
      brSize: brSize,
      gzSize: gzSize,
      minifiedBundlePortion,
      individualGzSize: gzSize,
      individualBrSize: brSize
    });
  }

  /**
   * Analyze the entire project, calculating bundle and module sizes
   */
  public async analyze(): Promise<void> {
    const bundles = this.project.getAllBundles();
    await Promise.all(bundles.map(b => this.analyzeBundle(b.bundle)));
  }

  private async analyzeBundle(bundle: Bundle): Promise<void> {
    // find the "vendor.js" bundle
    this.spinner?.succeedAndStart(
      `Finished gathering raw concat-stats data from bundle ${chalk.cyan(
        bundle.name
      )}.`
    );

    // populate the csv container with data from the venor bundle
    await bundle.prepareStats(this.csv);

    this.spinner?.succeed(
      `Done analyzing bundle: ${chalk.cyan(
        bundle.name
      )}. total size: ${chalk.yellow(`${toKB(bundle.sizes.brSize)} KB min+br`)}`
    );
  }
}

export default ReportGenerator;
