import { generateReport, Project as EmberProject } from "../src";

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
    await generateReport(project.projectPath);
    assert.ok(true);
  });
});
