import * as pkgUp from "pkg-up";
import * as path from "path";
import EmberProject from "./ember-project";
import ReportGenerator from "./report-generator";
import Spinner from "./spinner";

function findDefaultProjectLocation(): string {
  const pkgJsonPath = pkgUp.sync();
  if (!pkgJsonPath)
    throw new Error(
      `Could not find a package.json in the working directory or any parent folder\nthe command was run in: ${process.cwd()}`
    );
  return path.join(pkgJsonPath, "..");
}

function findDefaultReportOutputLocation(): string {
  return path.join(process.cwd(), "module-size-report.csv");
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
  projectPath = findDefaultProjectLocation(),
  reportPath = findDefaultReportOutputLocation()
): Promise<void> {
  const spinner = new Spinner();
  const project = new EmberProject(projectPath, spinner);
  const rptBuilder = new ReportGenerator(project, reportPath);
  await project.build();
  await rptBuilder.analyze();

  // // add other files from the ./public folder to the csv data
  // await this.addPublicFiles(
  //   path.join(this.project.distPath, "assets", "i18n", "support_en_US.js")
  // );
  await rptBuilder.save();
}

export { default as Spinner, SpinnerLike } from "./spinner";
export { default as Bundle, BundleSizes } from "./bundle";
export { default as Module, ModuleSizes } from "./module";
export { default as Stats } from "./stats-csv";
export { default as Project } from "./ember-project";
export { default as ReportGenerator } from "./report-generator";
export { BaseSize } from "./types";
