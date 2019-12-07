import { generateReport } from "../src";

QUnit.module("public API tests", _hooks => {
  QUnit.test("exported symbols are functions", assert => {
    assert.equal(
      "function",
      typeof generateReport,
      "generateReport is a function"
    );
  });
});
