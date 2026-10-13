import { WidgetSize } from '@randall/plugin-sdk'

/**
 * The state of the widget's dialog, as the widget's editor sees it.
 */
export interface WidgetEditState {
  /** The evaluated props, with the edits so far. Values bound to data hold their current value, and can't be edited. */
  values: Record<string, unknown>

  /** The selected path, like `markers.3`. */
  selection: string | null

  /** The size the widget is previewed at. */
  size: WidgetSize

  /** Whether the value at the path, or any value containing it, is bound to data. */
  isLocked(path: string): boolean
}
