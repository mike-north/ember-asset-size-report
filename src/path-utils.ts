import * as pkgUp from "pkg-up";
import * as path from "path";
/**
 * @internal
 */
export function findDefaultProjectLocation(): string {
  const pkgJsonPath = pkgUp.sync();
  if (!pkgJsonPath)
    throw new Error(
      `Could not find a package.json in the working directory or any parent folder\nthe command was run in: ${process.cwd()}`
    );
  return path.join(pkgJsonPath, "..");
}
/**
 * @internal
 */
export function findDefaultReportOutputLocation(): string {
  return path.join(process.cwd(), "module-size-report.csv");
}
