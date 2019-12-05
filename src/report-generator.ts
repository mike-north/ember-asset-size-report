import * as fs from "fs";
import * as path from "path";
import * as walkSync from "walk-sync";
import Bundle from "./bundle";
import { brotliCompress, gzipCompress } from "./compression";
import EmberProject from "./ember-project";
import { toKB } from "./formatting";
import Spinner, { SpinnerLike } from "./spinner";
import Stats from "./stats-csv";

/**
 * Report generation utility
 *
 * @beta
 */
class ReportGenerator {
  public constructor(
    private project: EmberProject,
    private reportPath: string = "module-size-report.csv"
  ) {}

  /**
   * Save the report to disk
   */
  public async save(): Promise<void> {
    await this.csv.save(this.project);
  }
  // create a container to hold Csv data
  private csv = new Stats(path.join(process.cwd(), this.reportPath));

  private get spinner(): SpinnerLike | undefined {
    return this.project.spinner;
  }
  /**
   * Add asset size data relating to a file within the ./public folder, to the
   * csv container
   */
  private async addPublicFiles(assetPath: string): Promise<void> {
    this.spinner?.start(
      `determining bundle size of 'public' asset: ${assetPath}`
    );
    const { size: minSize } = fs.statSync(assetPath);
    const en_US = fs.readFileSync(assetPath);
    const brSize = Buffer.byteLength(await brotliCompress(en_US));
    const gzSize = Buffer.byteLength(await gzipCompress(en_US, { level: 9 }));
    const minifiedBundlePortion = 1;
    this.spinner?.succeedAndStart(
      `determined bundle size of asset: ${assetPath} (${toKB(
        brSize
      )} KB brotli)`
    );
    this.csv.addFileRow(assetPath, assetPath, {
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
      `Finished gathering raw concat-stats data from bundle ${bundle.name}.`
    );

    // populate the csv container with data from the venor bundle
    await bundle.prepareStats(this.csv);

    this.spinner?.succeed(`Done analyzing bundle: ${bundle.name}
Total min + br: ${toKB(bundle.sizes.brSize)}`);
  }
}

export default ReportGenerator;
