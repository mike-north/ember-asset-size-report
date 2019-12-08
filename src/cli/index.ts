import * as yargs from "yargs";
import * as findUp from "find-up";
import * as fs from "fs-extra";
import * as cliui from "cliui";
import chalk from "chalk";

import { generateReport, GenerateReportOptions } from "../index";
import {
  findDefaultProjectLocation,
  findDefaultReportOutputLocation
} from "../path-utils";

function printArgSummary(
  ui: cliui.CLIUI,
  args: Partial<GenerateReportOptions>
): void {
  ["build", "project", "out", "extraJsFiles", "datasetName"].forEach(arg => {
    const key = arg as keyof GenerateReportOptions;
    ui.div(
      {
        text: arg,
        width: 20
      },
      {
        text: chalk.dim(JSON.stringify(args[key]))
      }
    );
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createProgram(argv = process.argv) {
  const configPath = findUp.sync([".asset-report", ".asset-report.json"]);
  const config = configPath ? fs.readJSONSync(configPath) : {};
  return yargs
    .option("out", {
      type: "string",
      description: "report output path"
    })
    .option("project", {
      type: "string",
      description: "path to the root of the ember-cli project"
    })
    .option("build", { type: "boolean", default: true })
    .option("dataset-name", { type: "string" })
    .option("extra-js-file", { array: true, default: [] as string[] })
    .config(config)
    .pkgConf("asset-report")
    .parse(argv);
}

export async function main(): Promise<void> {
  const prog = createProgram();
  const ui = cliui({ width: 80 });

  ui.div({ padding: [2, 0, 0, 0], text: "Ember-CLI Asset Size Report" });
  ui.div({ text: "----------------------------------" });
  ui.div({
    padding: [1, 0, 1, 0],
    text: chalk.dim("arguments received were as follows...")
  });
  const receivedOpts: Partial<GenerateReportOptions> = {
    build: prog.build,
    extraJsFiles: prog["extra-js-file"] ?? [],
    project: prog.project,
    datasetName: prog["dataset-name"],
    out: prog.out
  };
  printArgSummary(ui, receivedOpts);
  ui.div({
    padding: [1, 0, 1, 0],
    text: chalk.dim(
      "taking defaults and context into account, the following values will be used..."
    )
  });
  const resolvedOpts: Partial<GenerateReportOptions> = {
    build: receivedOpts.build,
    extraJsFiles: receivedOpts.extraJsFiles,
    project: receivedOpts.project ?? findDefaultProjectLocation(),
    out: receivedOpts.out ?? findDefaultReportOutputLocation(),
    datasetName: receivedOpts.datasetName ?? findDefaultReportOutputLocation()
  };
  printArgSummary(ui, resolvedOpts);
  ui.div();
  console.log(ui.toString());
  await generateReport(resolvedOpts);
}
