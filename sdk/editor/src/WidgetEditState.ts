import { Size } from 'ytil'

export interface WidgetEditState {
  /** The evaluated props, with the edits so far. Values bound to data hold their current value, and can't be edited. */
  values: Record<string, unknown>

  /** The selected path, like `markers.3`. */
  selection: string | null

  /** Values that only live while editing, like where a map with a bound center has been panned to. Not saved. */
  transient: Record<string, unknown>

  /** The size the widget is previewed at. */
  size: Size

  /** Whether the value at the path, or any value containing it, is bound to data. */
  isLocked(path: string): boolean
}
