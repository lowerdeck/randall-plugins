/**
 * Changes to the props, and the selection, made in one go. Changes to locked paths are ignored.
 */
export interface WidgetEdit {
  changes?: WidgetChange[]

  /** The path to select, or `null` to select nothing. The selection is left alone if not given. */
  select?: string | null
}

/** Sets the value at a path. An index just past the end of a list adds an item. */
export interface WidgetChange {
  path:  string
  value: unknown
}
