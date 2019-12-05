import * as zlib from "zlib";
import * as Terser from "terser";

const TERSER_OPTIONS = {
  compress: {
    // this is adversely affects heuristics for IIFE eval
    negate_iife: false,
    // limit sequences because of memory issues during parsing
    sequences: false
  },
  mangle: {
    safari10: true
  },
  output: {
    // no difference in size and much easier to debug
    semicolons: false
  }
};

const BROTLI_OPTIONS = {
  params: {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
  }
};

const GZIP_OPTIONS = { level: 9 };

/**
 * Compress a buffer using Brotli
 * @param buf - uncompressed buffer
 *
 * @private
 */
export function brotliCompress(buf: zlib.InputType): Promise<Buffer> {
  return new Promise<Buffer>((res, rej) => {
    zlib.brotliCompress(buf, BROTLI_OPTIONS, (err, result) => {
      if (err) rej(err);
      else res(result);
    });
  });
}

/**
 * Compress a buffer using Gzip
 *
 * @param buf - uncompressed buffer
 * @param opts - compresison options
 *
 * @private
 */
export function gzipCompress(
  buf: zlib.InputType,
  opts: zlib.ZlibOptions = {}
): Promise<Buffer> {
  return new Promise<Buffer>((res, rej) => {
    zlib.gzip(buf, { ...GZIP_OPTIONS, ...opts }, (err, result) => {
      if (err) rej(err);
      else res(result);
    });
  });
}

/**
 * Minify string content
 *
 * @param content - unminified content
 *
 * @private
 */
export function minify(content: string): string | undefined {
  return Terser.minify(content, TERSER_OPTIONS).code;
}
