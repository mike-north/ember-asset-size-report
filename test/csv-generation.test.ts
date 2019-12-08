import { existsSync, readFileSync } from "fs-extra";
import { join } from "path";
import * as pkgUp from "pkg-up";
import { generateReport, Project as EmberProject } from "../src";

const PKG_JSON_PATH = pkgUp.sync();
if (!PKG_JSON_PATH)
  throw new Error(
    "Tests can only be run in a folder (or child of folder) containing a package.json"
  );

QUnit.module("acceptance tests", hooks => {
  let project: EmberProject;
  let csvContentString: string;
  let csvData: string[][] = [];
  hooks.before(async assert => {
    project = await EmberProject.emberNewInTemp("my-app");
    const csvPath = join(
      PKG_JSON_PATH,
      "..",
      "samples",
      "module-size-report.csv"
    );
    await generateReport(project.path, csvPath);

    assert.ok(existsSync(csvPath), "output CSV exists");
    csvContentString = readFileSync(csvPath)
      .toString()
      .trim();
    csvData = (csvContentString ?? "")
      .split("\n")
      .map(row => row.split(",").map(cell => cell.trim()));
  });

  QUnit.test("CSV content is not blank", assert => {
    assert.ok(
      csvContentString && csvContentString.trim(),
      "CSV content is not blank"
    );
  });
  QUnit.test("some rows are present", assert => {
    assert.ok(csvData.length > 3, "More than three rows");
  });
  QUnit.test("one 'schema-version' row is present", assert => {
    const schemaVersionRows = csvData.filter(
      row => row[0] === "schema-version"
    );
    assert.equal(schemaVersionRows.length, 1, 'One "schema-version" row');
    assert.equal(schemaVersionRows[0][1], 3, 'Current "schema version" is 3');
  });

  QUnit.test("two 'header' rows are present", assert => {
    const headerRows = csvData.filter(
      row => !["schema-version", "module", "bundle"].includes(row[0])
    );
    assert.equal(headerRows.length, 2, "Two header rows");
    assert.deepEqual(
      headerRows[0],
      [
        "type",
        "dataset",
        "bundleName",
        "moduleName",
        "size",
        "minSize",
        "gzipSize",
        "brSize",
        "bundleRatio",
        "soloGzSize",
        "soloBrSize"
      ],
      'First header row is for "modules"'
    );
    assert.deepEqual(
      headerRows[1],
      [
        "type",
        "dataset",
        "bundleName",
        "size",
        "minSize",
        "gzipSize",
        "brSize"
      ],
      'Second header row is for "bundles"'
    );
  });
});
