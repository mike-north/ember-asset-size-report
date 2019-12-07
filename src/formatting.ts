import chalk from "chalk";
import * as cliui from "cliui";
import * as leftPad from "left-pad";
import { BaseSize } from "./types";
/**
 * Format a number of bytes as KB
 *
 * @param bytes - number of bytes
 *
 * @private
 */
export function toKB(bytes: number): string {
  return leftPad((bytes / 1024).toFixed(2), 8);
}

const SIZE_LABELS: { [K in keyof BaseSize]: string } = {
  minSize: "minified",
  brSize: "brotli",
  size: "original",
  gzSize: "gzip"
};

const SIZE_SORT = (a: string, b: string): number => {
  const aSum = a.toLowerCase().includes("sum");
  const bSum = b.toLowerCase().includes("sum");
  if (aSum && !bSum) return 1;
  else if (!aSum && bSum) return -1;
  else {
    return a.localeCompare(b);
  }
};

export function sizeSummaryString(sizes: BaseSize): string {
  const ui = cliui({ width: 80 });

  for (const sz of Object.keys(sizes)
    .filter(s => Object.keys(SIZE_LABELS).includes(s))
    .sort(SIZE_SORT)) {
    const s = sz as keyof BaseSize;
    ui.div(
      {
        text: SIZE_LABELS[s] ?? s,
        padding: [0, 0, 0, 5],
        width: 20
      },
      {
        text: chalk.yellow(toKB(sizes[s])),
        width: 8
      },
      {
        text: chalk.yellow(`KB`)
      }
    );
  }

  return ui.toString();
}
