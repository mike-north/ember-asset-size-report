/**
 * Format a number of bytes as KB
 *
 * @param bytes - number of bytes
 *
 * @private
 */
export function toKB(bytes: number): string {
  return (bytes / 1024).toFixed(2);
}
