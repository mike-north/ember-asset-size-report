import * as yargs from "yargs";
import * as findUp from "find-up";
import * as fs from "fs-extra";
import * as cliui from "cliui";
import chalk from "chalk";

import { generateReport, GenerateReportOptions } from "../index";
import { findDefaultProjectLocation } from "../path-utils";

function printArgSummary(args: Partial<GenerateReportOptions>): void {
  const ui = cliui({ width: 80 });

  ui.div({ padding: [2, 0, 0, 0], text: "Ember-CLI Asset Size Report" });
  ui.div({ text: "----------------------------------" });
  ui.div({
    padding: [0, 0, 2, 0],
    text: chalk.dim("arguments received were as follows...")
  });
  ["build", "project", "out", "extra-js-file"].forEach(arg => {
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
  ui.div();

  console.log(ui.toString());
}

export async function main(): Promise<void> {
  const configPath = await findUp([".asset-report", ".asset-report.json"]);
  const config = configPath ? fs.readJSONSync(configPath) : {};
  const prog = yargs
    .option("out", {
      type: "string",
      description: "report output path"
    })
    .option("project", {
      type: "string",
      description: "path to the root of the ember-cli project"
    })
    .option("build", { type: "boolean", default: true })
    .option("extra-js-file", { array: true, default: [] as string[] })
    .config(config)
    .pkgConf("asset-report")
    .parse(process.argv);
  const opts: Partial<GenerateReportOptions> = {
    build: prog.build,
    extraJsFiles: [...(prog["extra-js-file"] ?? [])],
    project: prog.project || findDefaultProjectLocation(),
    out: prog.out || findDefaultProjectLocation()
  };
  printArgSummary(opts);

  await generateReport(opts);
}
