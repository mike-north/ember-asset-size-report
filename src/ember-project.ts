import * as execa from "execa";
import * as fs from "fs-extra";
import * as path from "path";
import * as pkgUp from "pkg-up";
import * as tmp from "tmp";
import * as rimraf from "rimraf";
import * as walkSync from "walk-sync";

import { SpinnerLike } from "./spinner";
import Bundle from "./bundle";

export interface CommandOptions {
  env: { [k: string]: string };
  flags: string[];
}

const DEFAULT_EMBER_BUILD_OPTIONS: CommandOptions = {
  env: { EMBER_DATA_ROLLUP_PRIVATE: "false" },
  flags: ["-prod"]
};

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
   *
   * @beta
   */
  public static async emberNewInTemp(
    appName: string,
    spinner?: SpinnerLike
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
   * @param path - path to the ember-cli project
   * @param spinner - optional loading spinner to report progress
   *
   * @beta
   */
  public constructor(
    /**
     * Path on disk to the root of the project
     */
    public readonly path: string,
    /**
     * Optional loading spinner to report progress
     */
    public readonly spinner?: SpinnerLike
  ) {
    rimraf.sync(this.brotliOutPath);
    fs.ensureDirSync(this.brotliOutPath);
  }

  /**
   * Get a list of (optionally filtered) bundles available in this
   * ember app's build
   *
   * @param filter - optional filtering function
   *
   * @internal
   */
  public getAllBundles(
    filter: (s: string) => boolean = (): boolean => true
  ): { name: string; bundle: Bundle }[] {
    return walkSync(this.concatStatsPath, {
      directories: false,
      globs: ["*.js.json"]
    })
      .map(s => ({
        statsFolderName: s,
        name: s.split(/^[0-9]+-/)[1].replace(".json", "")
      }))
      .filter(({ name }) => filter(name))
      .map(({ statsFolderName, name }) => ({
        bundle: new Bundle(this, statsFolderName),
        name
      }));
  }

  /**
   * @internal
   */
  private get emberBinPath(): string {
    return path.join(this.path, "node_modules", ".bin", "ember");
  }
  /**
   * @internal
   */
  public get brotliOutPath(): string {
    return path.join(this.path, ".brotli-out");
  }

  /**
   * @internal
   */
  public get concatStatsPath(): string {
    return path.join(this.path, "concat-stats-for");
  }
  /**
   * @internal
   */
  public get distPath(): string {
    return path.join(this.path, "dist");
  }

  /**
   * Run "ember build"
   * @param opts - command options
   */
  public async build(opts?: {
    env: { [k: string]: string };
    flags: string[];
  }): Promise<void> {
    const { env, flags } = {
      ...DEFAULT_EMBER_BUILD_OPTIONS,
      ...(opts ?? {}),
      env: { ...DEFAULT_EMBER_BUILD_OPTIONS.env, ...((opts ?? {}).env ?? {}) }
    };
    if (process.env.SKIP_BUILD === undefined) {
      // delete old concat-stats data
      const child = execa("rm", ["-rf", this.concatStatsPath]);
      this.spinner?.spinAndPipeOutput(child);
      await child;

      this.spinner?.start(
        "Creating production build. This will take a minute or two..."
      );
      if (this.path !== process.cwd()) {
        this.spinner?.info("Using working directory: " + this.path);
      }
      await this.cmd(this.emberBinPath, ["build", ...flags], {
        ...env,
        CONCAT_STATS: "true"
      });

      this.spinner?.succeedAndStart("Completed production build.");
    }
  }

  private async cmd(
    command: string,
    args: string[],
    env: { [k: string]: string }
  ): Promise<void> {
    const child = execa(command, args, {
      cwd: this.path,
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
  /**
   * Run an ember-cli command, in the working directory of this project
   *
   * @param args  - arguments to pass to the command
   * @param env - environment variables
   *
   * @internal
   */
  private async ember(
    args: string[],
    env: { [k: string]: string } = {}
  ): Promise<void> {
    return this.cmd("ember", args, env);
  }
  /**
   * Run a `yarn` command in the working directory of this project
   *
   * @param args - arguments to pass to the command
   * @param env - environment variables
   *
   * @internal
   */
  private async yarn(
    args: string[],
    env: { [k: string]: string } = {}
  ): Promise<void> {
    return this.cmd("yarn", args, env);
  }
  /**
   * Install an ember addon to this project
   * @param name - addon to install
   *
   * @internal
   */
  private async installAddon(name: string): Promise<void> {
    await this.ember(["install", name]);
  }
  /**
   * Install a devDependency via yarn
   *
   * @param name - npm package name to install as a devDependency
   * @param target - version target of the package
   *
   * @internal
   */
  private async installDevDep(name: string, target = "latest"): Promise<void> {
    await this.yarn(["add", "-D", `${name}@${target}`]);
  }
  /**
   * Install a dependency via yarn
   *
   * @param name - npm package name to install as a devDependency
   * @param target - version target of the package
   *
   * @internal
   */
  private async installDep(name: string, target = "latest"): Promise<void> {
    await this.yarn(["add", `${name}@${target}`]);
  }
}

export default EmberProject;
