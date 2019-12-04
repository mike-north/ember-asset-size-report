/**
 * Asset size report generator
 *
 * @packageDocumentation
 */

import * as fs from "fs-extra";
import * as path from "path";

import * as walkSync from "walk-sync";
import * as execa from "execa";
import * as rimraf from "rimraf";
import {
  BROT_OUT_DIR,
  PROJECT_PATH,
  EMBER_BIN_PATH,
  CONCAT_STATS_FOR_PATH,
  DIST_PATH
} from "./paths";
import { SPIN, spinnerSucceedAndStart, spinAndPipeOutput } from "./spinner";
import { brotliCompress, gzipCompress } from "./compression";
import { toKB } from "./formatting";
import Bundle from "./bundle";
import StatsCsv from "./stats-csv";

rimraf.sync(BROT_OUT_DIR);
fs.ensureDirSync(BROT_OUT_DIR);

/**
 * Create a production build of the ember app
 */
async function maybeCreateEmberProdBuild() {
  SPIN.start("Creating production build. This will take a minute or two...");

  const buildPromise = execa(EMBER_BIN_PATH, ["build", "-prod"], {
    env: {
      CONCAT_STATS: "true",
      EMBER_DATA_ROLLUP_PRIVATE: "false"
    }
  });
  if (!buildPromise.stdout || !buildPromise.stderr)
    throw new Error(
      "Expected child process to provide stdout and stderr streams"
    );
  spinAndPipeOutput(buildPromise);
  await buildPromise;
  spinnerSucceedAndStart("Completed production build.");
}

/**
 * Find stats for a bundle matching a particular path
 */
async function findBundleStats(
  statsPath: string,
  bundlePath: string
): Promise<Bundle> {
  SPIN.start(`Finding bundle: ${bundlePath}`);
  let bun = walkSync(statsPath, {
    directories: false,
    globs: ["*.js.json"]
  })
    .map(file => new Bundle(statsPath, file))
    .find(bundle => bundle.statsFileContents.outputFile.endsWith(bundlePath));
  if (!bun) throw new Error(`No bundle ending with "${bundlePath}" found`);
  return bun;
}

/**
 * Add asset size data relating to a file within the ./public folder, to the
 * csv container
 */
async function addPublicFiles(csv: StatsCsv, assetPath: string): Promise<void> {
  SPIN.start(`determining bundle size of 'public' asset: ${assetPath}`);
  let { size: minSize } = fs.statSync(assetPath);
  let en_US = fs.readFileSync(assetPath);
  let brSize = Buffer.byteLength(await brotliCompress(en_US));
  let gzSize = Buffer.byteLength(await gzipCompress(en_US, { level: 9 }));

  spinnerSucceedAndStart(
    `determined bundle size of asset: ${assetPath} (${toKB(brSize)} KB brotli)`
  );
  csv.addRow(assetPath, {
    size: 0,
    brSize,
    minSize,
    gzSize
  });
}

/**
 * Run the asset size report generator
 *
 * @public
 */
export async function run() {
  if (process.env.SKIP_BUILD === undefined) {
    // delete old concat-stats data
    await execa("rm", ["-rf", CONCAT_STATS_FOR_PATH]);
    await maybeCreateEmberProdBuild(); // ember build -prod
  }
  // find the "vendor.js" bundle
  let vendorBundle = await findBundleStats(
    CONCAT_STATS_FOR_PATH,
    "assets/vendor.js"
  );
  spinnerSucceedAndStart("Finished gathering raw concat-stats data.");

  // create a container to hold Csv data
  const csv = new StatsCsv(path.join(PROJECT_PATH, "module-size-report.csv"), [
    "moduleName",
    "size",
    "minSize",
    "gzipSize",
    "brSize"
  ]);

  // populate the csv container with data from the venor bundle
  await vendorBundle.prepareCSV(csv);

  // add other files from the ./public folder to the csv data
  await addPublicFiles(
    csv,
    path.join(DIST_PATH, "assets", "i18n", "support_en_US.js")
  );

  // write the csv to a file
  await csv.save();
  spinnerSucceedAndStart("Finished writing raw data to disk.");

  SPIN.succeed(`Done. Total min + br: ${toKB(vendorBundle.brSize)}`);
}
