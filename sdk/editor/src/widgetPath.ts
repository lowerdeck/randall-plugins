/** Joins path segments, like `widgetPath('markers', 3, 'location')` to `markers.3.location`. */
export function widgetPath(...segments: Array<string | number>): string {
  return segments.join('.')
}

/** The index of an item in a list, given a path like `markers.3`, or `null` if the path isn't one. */
export function listIndex(path: string | null, list: string): number | null {
  if (path == null) { return null }

  const match = path.match(/^(.+)\.(\d+)$/)
  if (match == null || match[1] !== list) { return null }
  return parseInt(match[2], 10)
}
