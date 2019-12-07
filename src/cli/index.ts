import * as yargs from "yargs";
import * as findUp from "find-up";
import * as fs from "fs-extra";
import * as cliui from "cliui";
import chalk from "chalk";

import { generateReport } from "../index";

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
    .option("extra-js-file", { array: true })
    .config(config)
    .pkgConf("asset-report")
    .parse(process.argv);

  const ui = cliui({ width: 80 });

  ui.div({ text: "Arguments" });
  ui.div({ text: "-----------------" });
  ["build", "project", "out", "extra-js-file"].forEach(arg => {
    ui.div(
      {
        text: arg,
        width: 20
      },
      {
        text: chalk.dim(prog[arg] as any)
      }
    );
  });

  console.log(ui.toString());
  // const argv;

  // await generateReport({});
}
