<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ember-asset-size-report](./ember-asset-size-report.md) &gt; [Bundle](./ember-asset-size-report.bundle.md)

## Bundle class

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Asset size stats relating to a specific client-side JS bundle

<b>Signature:</b>

```typescript
declare class Bundle 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(project, bundleName)](./ember-asset-size-report.bundle._constructor_.md) |  | <b><i>(BETA)</i></b> Create a new bundle |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [contents](./ember-asset-size-report.bundle.contents.md) |  | <code>string</code> | <b><i>(BETA)</i></b> The contents of the entire bundle |
|  [name](./ember-asset-size-report.bundle.name.md) |  | <code>string</code> | <b><i>(BETA)</i></b> The name of this bundle |
|  [project](./ember-asset-size-report.bundle.project.md) |  | <code>EmberProject</code> | <b><i>(BETA)</i></b> The project that this bundle belongs to |
|  [sizes](./ember-asset-size-report.bundle.sizes.md) |  | <code>BundleSizes</code> | <b><i>(BETA)</i></b> Size information pertaining to this bundle |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [addFile(file)](./ember-asset-size-report.bundle.addfile.md) |  | <b><i>(BETA)</i></b> Explicitly add a file to this bundle |
|  [calculateSizes()](./ember-asset-size-report.bundle.calculatesizes.md) |  | <b><i>(BETA)</i></b> Determine the sizes of all of the files within the bundle, such that the summation of the bundle's contents add up to the total size of the bundle. |
|  [prepareStats(data)](./ember-asset-size-report.bundle.preparestats.md) |  | <b><i>(BETA)</i></b> Prepare a stats report with asset size data pertaining to this module |
