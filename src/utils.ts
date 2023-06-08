/**
 * Convert a path into an S3 key.
 */
export function normalizeS3Path(path: string): string {
  if (path.startsWith('/')) {
    return path.substring(1)
  }

  return path
}
