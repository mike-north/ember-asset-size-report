import * as pkgUp from "pkg-up";
import * as path from "path";
import EmberProject from "./ember-project";
import ReportGenerator from "./report-generator";
import Spinner from "./spinner";
import {
  findDefaultProjectLocation,
  findDefaultReportOutputLocation
} from "./path-utils";

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
}

const DEFAULT_OPTIONS: GenerateReportOptions = {
  project: findDefaultProjectLocation(),
  out: findDefaultReportOutputLocation(),
  build: true,
  extraJsFiles: []
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
    out
  }: GenerateReportOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  const spinner = new Spinner();
  const proj = new EmberProject(project, spinner);
  const rptBuilder = new ReportGenerator(proj, out);
  if (build) {
    await proj.build();
  }
  await rptBuilder.analyze();

  // add other files from the ./public folder to the csv data
  await Promise.all(
    includeFiles.map(filePath =>
      rptBuilder.addPublicFile(path.join(proj.distPath, filePath))
    )
  );
  await rptBuilder.save();
}

export { default as Spinner, SpinnerLike } from "./spinner";
export { default as Bundle, BundleSizes } from "./bundle";
export { default as Module, ModuleSizes } from "./module";
export { default as Stats } from "./stats-csv";
export { default as Project } from "./ember-project";
export { default as ReportGenerator } from "./report-generator";
export { BaseSize } from "./types";
