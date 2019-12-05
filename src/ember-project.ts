import * as execa from "execa";
import * as fs from "fs-extra";
import * as path from "path";
import * as pkgUp from "pkg-up";
import * as tmp from "tmp";
import * as rimraf from "rimraf";
import * as walkSync from "walk-sync";

import { ISpinner } from "./spinner";
import Bundle from "./bundle";

/**
 * A "controller" for an ember-cli project
 *
 * @beta
 */
class EmberProject {
  /**
   * Create a new app via `ember new` in a temporary folder
   *
   * @param appName - name of the ember app
   * @param spinner - optional loading spinner
   */
  static async emberNewInTemp(
    appName: string,
    spinner?: ISpinner
  ): Promise<EmberProject> {
    const folder = tmp.dirSync();
    const pkgJsonPath = pkgUp.sync();
    if (!pkgJsonPath)
      throw new Error(
        "No package.json found in " + process.cwd() + " or any parent directory"
      );
    const ecliBin = path.join(
      pkgJsonPath,
      "..",
      "node_modules",
      ".bin",
      "ember"
    );
    const emberCmd = execa(
      ecliBin,
      ["new", appName, "--skip-git", "--no-welcome", "--yarn"],
      {
        cwd: path.join(folder.name, ".."),
        stdout: process.stdout,
        stderr: process.stderr
      }
    );
    await emberCmd;
    const project = new EmberProject(folder.name, spinner);
    await project.installDevDep("broccoli-concat-analyser");

    return project;
  }

  /**
   * Setup a preexisting project
   * @param projectPath - path to the ember-cli project
   * @param spinner - optional loading spinner to report progress
   */
  constructor(public readonly projectPath: string, public spinner?: ISpinner) {
    rimraf.sync(this.brotliOutPath);
    fs.ensureDirSync(this.brotliOutPath);
  }

  getAllBundles() {
    return walkSync(this.concatStatsPath, {
      directories: false,
      globs: ["*.js.json"]
    }).map(s => ({
      bundle: new Bundle(this, s),
      name: s.split(/^[0-9]+\-/)[1].replace(".json", "")
    }));
  }

  private get emberBinPath() {
    return path.join(this.projectPath, "node_modules", ".bin", "ember");
  }
  public get brotliOutPath() {
    return path.join(this.projectPath, ".brotli-out");
  }

  public get concatStatsPath() {
    return path.join(this.projectPath, "concat-stats-for");
  }
  public get distPath() {
    return path.join(this.projectPath, "dist");
  }

  async build() {
    if (process.env.SKIP_BUILD === undefined) {
      // delete old concat-stats data
      let child = execa("rm", ["-rf", this.concatStatsPath]);
      this.spinner?.spinAndPipeOutput(child);
      await child;
      await this.maybeCreateEmberProdBuild(this.emberBinPath, this.projectPath); // ember build -prod
    }
  }

  private async cmd(
    command: string,
    args: string[],
    env: { [k: string]: string }
  ) {
    const child = execa(command, args, {
      cwd: this.projectPath,
      env: {
        ...process.env,
        ...env
      }
    });
    if (!child.stdout || !child.stderr)
      throw new Error(
        "Expected child process to provide stdout and stderr streams"
      );
    this.spinner?.spinAndPipeOutput(child);
    await child;
  }
  private async ember(args: string[], env: { [k: string]: string } = {}) {
    return this.cmd("ember", args, env);
  }
  private async yarn(args: string[], env: { [k: string]: string } = {}) {
    return this.cmd("yarn", args, env);
  }
  private async installAddon(name: string) {
    await this.ember(["install", name]);
  }
  private async installDevDep(name: string) {
    await this.yarn(["add", "-D", name]);
  }
  private async installDep(name: string) {
    await this.yarn(["add", name]);
  }

  /**
   * Create a production build of the ember app
   */
  private async maybeCreateEmberProdBuild(emberPath: string, cwd: string) {
    this.spinner?.start(
      "Creating production build. This will take a minute or two..."
    );
    if (cwd !== process.cwd()) {
      this.spinner?.info("Using working directory: " + cwd);
    }
    await this.cmd(this.emberBinPath, ["build", "-prod"], {
      CONCAT_STATS: "true",
      EMBER_DATA_ROLLUP_PRIVATE: "false"
    });

    this.spinner?.succeedAndStart("Completed production build.");
  }
}

export default EmberProject;
