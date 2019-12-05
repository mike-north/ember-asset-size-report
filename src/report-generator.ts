import * as fs from "fs";
import * as path from "path";
import * as walkSync from "walk-sync";
import Bundle from "./bundle";
import { brotliCompress, gzipCompress } from "./compression";
import EmberProject from "./ember-project";
import { toKB } from "./formatting";
import Spinner, { ISpinner } from "./spinner";
import StatsCsv from "./stats-csv";

/**
 * Report generation utility
 *
 * @beta
 */
class ReportGenerator {
  public constructor(
    protected project: EmberProject,
    protected reportPath: string
  ) {}

  public async save(): Promise<void> {
    await this.csv.save(this.project);
  }
  // create a container to hold Csv data
  protected csv = new StatsCsv(
    path.join(process.cwd(), "module-size-report.csv")
  );

  protected get spinner(): ISpinner | undefined {
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
    const bundlePortion = 1;
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
      bundlePortion,
      individualGzSize: gzSize,
      individualBrSize: brSize
    });
  }

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
    await bundle.prepareCSV(this.csv);

    this.spinner?.succeed(`Done analyzing bundle: ${bundle.name}
Total min + br: ${toKB(bundle.sizes.brSize)}`);
  }
}

export default ReportGenerator;
