import * as ora from "ora";
import { ExecaChildProcess } from "execa";
import * as walkSync from "walk-sync";

import Bundle from "./bundle";

const PLEASE_WAIT_TEXT = "Please wait...";

export interface ISpinner {
  succeed(msg: string): ISpinner;
  spinAndPipeOutput(child: ExecaChildProcess<string>): void;
  start(msg?: string): ISpinner;
  info(msg: string): ISpinner;
  succeedAndStart(msg: string): void;
  render(): void;
  text: string;
}

/**
 * Loading spinner
 *
 * @beta
 */
class Spinner implements ISpinner {
  private _spin = ora();
  constructor() {
    this._spin.start(PLEASE_WAIT_TEXT);
  }
  succeedAndStart(str: string) {
    this._spin.succeed(str).start(PLEASE_WAIT_TEXT);
  }
  get text() {
    return this._spin.text;
  }
  set text(txt: string) {
    this._spin.text = txt;
  }

  spinAndPipeOutputToStream(
    from: NodeJS.ReadableStream,
    to: NodeJS.WritableStream
  ) {
    const listener = (data: string | Buffer) => {
      this._spin.clear();
      to.write(data);
      this._spin.render();
    };
    from.on("data", listener);
    from.on("close", () => from.off("data", listener));
  }
  start(text: string) {
    this._spin.start(text);
    return this;
  }
  succeed(text: string) {
    this._spin.succeed(text);
    return this;
  }
  info(text: string) {
    this._spin.info(text);
    return this;
  }
  render() {
    this._spin.render();
    return this;
  }
  spinAndPipeOutput(pr: ExecaChildProcess<string>) {
    pr.stdout && this.spinAndPipeOutputToStream(pr.stdout, process.stdout);
    pr.stderr && this.spinAndPipeOutputToStream(pr.stderr, process.stderr);
  }
}
export default Spinner;
