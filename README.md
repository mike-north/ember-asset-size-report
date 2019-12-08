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

Check out our [api documentation](https://github.com/mike-north/ember-asset-size-report/blob/master/docs/ember-asset-size-report.md)

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

The csv format is designed to be easy to parse with tools like Google Sheets. To allow for easy backwards compatibility in parsing logic, data output is _versioned_. Please consult the [#Schema]

###### Example output

```csv
"schema-version", 2

"type","bundleName","moduleName","size","minSize","gzipSize","brSize","bundleRatio","soloGzSize","soloBrSize"

"type", "bundleName", "size", "minSize", "gzipSize", "brSize"

module, ember-fetch.js, abortcontroller.js, 4977, 1913, 637.4097502014504, 566.693493150685, 0.1926873489121676, 774, 655
module, ember-fetch.js, fetch.js, 14540, 8015, 2670.5902497985494, 2374.3065068493147, 0.8073126510878323, 2687, 2390
module, my-app.js, vendor/ember-cli/app-prefix.js, 16, 13, 3.0681440443213295, 2.6849861495844873, 0.0014404432132963988, 33, 17
module, my-app.js, my-app/adapters/-json-api.js, 343, 242, 57.11468144044321, 49.982049861495845, 0.026814404432132965, 183, 159
module, my-app.js, my-app/app.js, 3117, 1668, 393.66648199445984, 344.50437673130193, 0.18481994459833795, 755, 656

bundle, ember-fetch.js, 19519, 9928, 3308, 2941
bundle, my-app.js, 15861, 9025, 2130, 1864
bundle, ember-testing.js, 81182, 22122, 5569, 4962
bundle, ember.js, 1951427, 490714, 126574, 106521
bundle, vendor.js, 2855105, 731260, 183679, 152473
```

### Extracting multiple tables from the CSV

Multiple tables (i.e., "modules" and "bundles" can be extracted from the single `.csv` file, using the conventions described above). [Here is an example](https://docs.google.com/spreadsheets/d/1vhor2qAQtWnTu_GNI4LaLZeu9Li0lZVi-koseZG2tTg/edit?usp=sharing) of Google Sheets being used to analyze CSV data pulled directly from this github repo

### Schema

##### schema-version (1 row)

This numeric version allows us to introduce breaking changes to the output format, while preserving the ability to parse both old and new data

#### Version 3

There are several sections

##### module data headers (1 row)

a single row of headers corresponding to module data

##### bundle data headers (1 row)

a single row of headers corresponding to bundle data

##### module data (many rows)

these rows always begin with "module" in the first column

##### bundle data (many rows)

these rows always begin with "bundle" in the first column

## Legal

&copy; 2019 LinkedIn All Rights Reserved
