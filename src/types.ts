/**
 * Bundle or module size information
 * @beta
 */
export interface BaseSize {
  /**
   * minified size
   */
  minSize: number;
  /**
   * brotli size
   */
  brSize: number;
  /**
   * gzip size
   */
  gzSize: number;
  /**
   * original (un-minified) size
   */
  size: number;
}
