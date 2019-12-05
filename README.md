# ember-asset-size-report

A utility for generating CSV files describing the assets in your ember-cli bundles

## Usage

First, ensure you have [`broccoli-concat-analyser`](https://github.com/stefanpenner/broccoli-concat-analyser/) installed in your app

### As a CLI tool

You should then be able to run

```sh
npx ember-asset-size-report
```

and after the command is done, you'll find a `module-size-report.csv` in your working directory

### As a library

```ts
import { generateReport } from "ember-asset-size-report";

async function main() {
  await generateReport(
    "path-to-my-ember-project-root", // optional
    "my-desired-report-output-path.csv" // optional
  );
}
```

## Experimental Usage

Experimental use (read: no SemVer guarantees) of a lower level JavaScript API

If you're using typescript, you'll need to make the following adustment to your `tsconfig.json` in order to "detect" this new API surface

```json
"paths": {
    "ember-asset-size-report": ["node_modules/ember-asset-size-report/dist/ember-asset-size-report-beta.d.ts"]
}
```

You should then be able to do something like

```ts
import {
  Spinner,
  EmberProject,
  ReportGenerator
} from "ember-asset-size-report";

// Create a progress spinner
const spinner = new Spinner();

// Create a "controller" for your ember-cli project
const project = new EmberProject("/Users/me/my-project-path", spinner);
// Create a report generator
const rptBuilder = new ReportGenerator(project, "/Users/me/my-report.csv");
// Create a prod build of the ember app, with concat stats output enabled
await project.build();

// analyze the stats data (and other things) to arrive at module/bundle sizes
await rptBuilder.analyze();

// add other files from the ./public folder to the csv data
await rptBuilder.addPublicFile(
  path.join(project.distPath, "assets", "i18n", "support_en_US.js")
);

// save the report. the .csv file should now appear
await rptBuilder.save();
```

## CSV Format

The csv format is designed to be easy to parse with tools like Google Sheets.

```csv
"schema-version", 2
"type","bundleName","moduleName","size","minSize","gzipSize","brSize","bundleRatio","soloGzSize","soloBrSize"
"type", "bundleName", "size", "minSize", "gzipSize", "brSize"

```

There are several sections

### schema-version (1 row)

This numeric version allows us to introduce breaking changes to the output format, while preserving the ability to parse both old and new data

### module data headers (1 row)

a single row of headers corresponding to module data

### bundle data headers (1 row)

a single row of headers corresponding to bundle data

### module data (many rows)

these rows always begin with "module" in the first column

### bundle data (many rows)

these rows always begin with "bundle" in the first column

## Legal

&copy; 2019 LinkedIn All Rights Reserved
