import * as ora from "ora";
import { ExecaChildProcess } from "execa";
import { Readable } from "stream";

const PLEASE_WAIT_TEXT = "Please wait...";
export const SPIN = ora().start(PLEASE_WAIT_TEXT);

export function spinnerSucceedAndStart(str: string) {
  SPIN.succeed(str).start(PLEASE_WAIT_TEXT);
}

export function spinAndPipeOutputToStream(
  from: NodeJS.ReadableStream,
  to: NodeJS.WritableStream
) {
  const listener = (data: string | Buffer) => {
    SPIN.clear();
    to.write(data);
    SPIN.render();
  };
  from.on("data", listener);
  from.on("close", () => from.off("data", listener));
}

export function spinAndPipeOutput(pr: ExecaChildProcess<string>) {
  pr.stdout && spinAndPipeOutputToStream(pr.stdout, process.stdout);
  pr.stderr && spinAndPipeOutputToStream(pr.stderr, process.stderr);
}
