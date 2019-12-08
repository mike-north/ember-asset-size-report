import * as pkgUp from "pkg-up";
import * as path from "path";
import chalk from "chalk";

import EmberProject from "./ember-project";
import ReportGenerator from "./report-generator";
import Spinner from "./spinner";
import {
  findDefaultProjectLocation,
  findDefaultReportOutputLocation
} from "./path-utils";
import { existsSync } from "fs-extra";
import cliui = require("cliui");

/**
 * Options to pass to the {@link (generateReport:2) | generateReport() function}
 *
 * @beta
 */
export interface GenerateReportOptions {
  /**
   *  path to ember-cli project
   */
  project: string;
  /**
   *  path to write CSV output to
   */
  out: string;
  /**
   * should we make a prod build of the ember-cli app?
   */
  build: boolean;
  /**
   * any extra JS files we should include?
   */
  extraJsFiles: string[];
  /**
   * name of this dataset
   */
  datasetName: string;
  /**
   * if csv file is found to already exist, should we amend data to it or replace it?
   */
  appendData: boolean;
}

const DEFAULT_OPTIONS: GenerateReportOptions = {
  project: findDefaultProjectLocation(),
  out: findDefaultReportOutputLocation(),
  build: true,
  extraJsFiles: [],
  appendData: true,
  datasetName: findDefaultReportOutputLocation()
};

function buildOptions(
  optionsOrProjectPath?: Partial<GenerateReportOptions> | string,
  reportPath?: string
): Partial<GenerateReportOptions> {
  if (optionsOrProjectPath && typeof optionsOrProjectPath === "string") {
    // two string signature
    const result: Partial<GenerateReportOptions> = {};
    if (optionsOrProjectPath) result.project = optionsOrProjectPath;
    if (reportPath) result.out = reportPath;

    return result;
  } else if (typeof optionsOrProjectPath !== "string" && !reportPath) {
    // options object signature
    return optionsOrProjectPath ?? {};
  } else
    throw new Error(
      `Invalid arguments passed to 'generateReport'
${
  // eslint-disable-next-line prefer-rest-params
  JSON.stringify(arguments)
}`
    );
}

/**
 * Generate the report
 *
 * @param projectPath - path to ember-cli project
 * @param reportPath - path to write CSV output to
 *
 * @public
 */
export async function generateReport(
  projectPath?: string,
  reportPath?: string
): Promise<void>;
/**
 * Generate the report
 *
 * @param options - {@link GenerateReportOptions | options}
 *
 * @beta
 */
export async function generateReport(
  options?: Partial<GenerateReportOptions>
): Promise<void>;
export async function generateReport(
  optionsOrProjectPath?: Partial<GenerateReportOptions> | string,
  reportPath?: string
): Promise<void> {
  const options = buildOptions(optionsOrProjectPath, reportPath);
  const {
    build,
    extraJsFiles: includeFiles,
    project,
    datasetName,
    appendData,
    out
  }: GenerateReportOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  const spinner = new Spinner();
  const proj = new EmberProject(project, spinner);
  const includedFilePaths = includeFiles.map(p => path.join(proj.distPath, p));

  const rptBuilder = new ReportGenerator(proj, out, {
    datasetName,
    appendData
  });
  if (build) {
    await proj.build();
  }
  if (includedFilePaths.length > 0) {
    spinner.start("validating presence of included files");
    includedFilePaths.forEach(p => {
      if (!existsSync(p)) throw new Error("not found: " + chalk.cyan(p));
      spinner.succeed("found included JS file: " + chalk.cyan(p));
    });
  }
  spinner.start("analyzing bundles...");
  await rptBuilder.analyze();

  // add other files from the ./public folder to the csv data
  await Promise.all(
    includedFilePaths.map(filePath => rptBuilder.addPublicFile(filePath))
  );
  await rptBuilder.save();
  const ui = cliui();
  spinner.succeed(
    chalk.bold("done! Your report is here --> " + chalk.greenBright(out))
  );
}

export { default as Spinner, SpinnerLike } from "./spinner";
export { default as Bundle, BundleSizes } from "./bundle";
export { default as Module, ModuleSizes } from "./module";
export { default as Stats } from "./stats-csv";
export { default as Project } from "./ember-project";
export { default as ReportGenerator } from "./report-generator";
export { BaseSize } from "./types";
