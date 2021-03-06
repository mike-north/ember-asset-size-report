<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ember-asset-size-report](./ember-asset-size-report.md) &gt; [ModuleSizes](./ember-asset-size-report.modulesizes.md)

## ModuleSizes interface

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Size information pertaining to a module

<b>Signature:</b>

```typescript
export interface ModuleSizes extends BaseSize 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [individualBrSize](./ember-asset-size-report.modulesizes.individualbrsize.md) | <code>number</code> | <b><i>(BETA)</i></b> The brotli'd size of this module \_when compressed individually\_ |
|  [individualGzSize](./ember-asset-size-report.modulesizes.individualgzsize.md) | <code>number</code> | <b><i>(BETA)</i></b> The gzipped size of this module \_when compressed individually\_ |
|  [minifiedBundlePortion](./ember-asset-size-report.modulesizes.minifiedbundleportion.md) | <code>number</code> | <b><i>(BETA)</i></b> The portion of this module's bundle's size that this module is responsible for |

