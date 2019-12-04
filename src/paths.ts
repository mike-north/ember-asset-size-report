import * as pkgUp from "pkg-up";
import * as path from "path";

// path of package.json
const PKG_JSON_PATH = pkgUp.sync({ cwd: process.cwd() });
if (!PKG_JSON_PATH)
  throw new Error(
    "Could not find a package.json in any parent directory (cwd: " +
      __dirname +
      ")"
  );
// path of the project root
export const PROJECT_PATH = path.join(PKG_JSON_PATH, "..");
// path to the `ember` command
export const EMBER_BIN_PATH = path.join(
  PROJECT_PATH,
  "node_modules",
  ".bin",
  "ember"
);
// path to the ./dist folder
export const DIST_PATH = path.join(PROJECT_PATH, "dist");
// path to the ./concat-stats-for folder
export const CONCAT_STATS_FOR_PATH = path.join(
  PROJECT_PATH,
  "concat-stats-for"
);

// path to the temporary folder used to write brotli-compressed files
export const BROT_OUT_DIR = path.join(PROJECT_PATH, ".brotli-out");
