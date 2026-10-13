import { WidgetEdit } from './WidgetEdit'
import { WidgetEditorHost } from './WidgetEditorHost'
import { WidgetEditState } from './WidgetEditState'

/**
 * A search bar above the content, like for finding a place on a map. Picking a result edits the widget.
 */
export interface WidgetSearch<R = any> {
  placeholder?: string

  search(query: string, host: WidgetEditorHost): Promise<R[]>
  label(result: R): string

  /** Tells results apart, if their labels may not. */
  key?(result: R): string

  apply(result: R, state: WidgetEditState): WidgetEdit

  enabled?(state: WidgetEditState): boolean
}
