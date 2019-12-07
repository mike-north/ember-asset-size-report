import { generateReport, Project as EmberProject } from "../src";
import { join } from "path";
import * as pkgUp from "pkg-up";
const PKG_JSON_PATH = pkgUp.sync();
if (!PKG_JSON_PATH)
  throw new Error(
    "Tests can only be run in a folder (or child of folder) containing a package.json"
  );

QUnit.module("acceptance tests", _hooks => {
  QUnit.test("exported symbols are functions", assert => {
    assert.equal(
      "function",
      typeof generateReport,
      "generateReport is a function"
    );
  });

  QUnit.test("create + build", async assert => {
    const project = await EmberProject.emberNewInTemp("my-app");
    await generateReport(
      project.path,
      join(PKG_JSON_PATH, "..", "samples", "module-size-report.csv")
    );
    assert.ok(true);
  });
});
