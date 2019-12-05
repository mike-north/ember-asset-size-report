import { ExecaChildProcess } from "execa";
import * as ora from "ora";

const PLEASE_WAIT_TEXT = "Please wait...";

/**
 * A loading spinner
 * @beta
 */
export interface SpinnerLike {
  /**
   * Print a success message to the console
   * @param text - success message
   */
  succeed(msg: string): SpinnerLike;
  /**
   * Pipe output from a child process to the console, while
   * continuing to spin
   * @param pr - child process (i.e., from `execa`)
   * @internal
   */
  spinAndPipeOutput(child: {
    stdout: NodeJS.ReadableStream | null;
    stderr: NodeJS.ReadableStream | null;
  }): void;

  /**
   * Start spinning
   * @param text - spinner text
   */
  start(msg?: string): SpinnerLike;
  /**
   * Print an info message to the console
   * @param text - info message
   */
  info(msg: string): SpinnerLike;
  /**
   * Print a success message to the console, and resume spinning
   * @param str - success message
   */
  succeedAndStart(msg: string): void;
  /**
   * Paint a frame of the spinner
   * @internal
   */
  render(): void;
  /**
   * Spinner text
   */
  text: string;
}

/**
 * Loading spinner
 *
 * @beta
 */
class Spinner implements SpinnerLike {
  private _spin = ora();
  public constructor() {
    this._spin.start(PLEASE_WAIT_TEXT);
  }

  /** {@inheritDoc SpinnerLike.succeedAndStart} */
  public succeedAndStart(str: string): void {
    this._spin.succeed(str).start(PLEASE_WAIT_TEXT);
  }
  /** {@inheritDoc SpinnerLike.text} */
  public get text(): string {
    return this._spin.text;
  }
  public set text(txt: string) {
    this._spin.text = txt;
  }

  /**
   * Keep the spinner going, while piping data from one stream to another
   *
   * @param from - stream to read from
   * @param to - stream to write to
   *
   * @internal
   */
  private spinAndPipeOutputToStream(
    from: NodeJS.ReadableStream,
    to: NodeJS.WritableStream
  ): void {
    const listener = (data: string | Buffer): void => {
      this._spin.clear();
      to.write(data);
      this._spin.render();
    };
    from.on("data", listener);
    from.on("close", () => from.off("data", listener));
  }

  /** {@inheritDoc SpinnerLike.start} */
  public start(text: string): Spinner {
    this._spin.start(text);
    return this;
  }

  /** {@inheritDoc SpinnerLike.succeed} */
  public succeed(text: string): Spinner {
    this._spin.succeed(text);
    return this;
  }

  /** {@inheritDoc SpinnerLike.info} */
  public info(text: string): Spinner {
    this._spin.info(text);
    return this;
  }

  /**
   * @internal
   * {@inheritDoc SpinnerLike.render}
   **/
  public render(): Spinner {
    this._spin.render();
    return this;
  }

  /**
   * @internal
   * {@inheritDoc SpinnerLike.spinAndPipeOutput}
   **/
  public spinAndPipeOutput(pr: {
    stdout: NodeJS.ReadableStream | null;
    stderr: NodeJS.ReadableStream | null;
  }): void {
    pr.stdout && this.spinAndPipeOutputToStream(pr.stdout, process.stdout);
    pr.stderr && this.spinAndPipeOutputToStream(pr.stderr, process.stderr);
  }
}
export default Spinner;
