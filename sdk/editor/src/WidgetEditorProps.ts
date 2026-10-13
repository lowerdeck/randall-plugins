import { WidgetSize } from '@randall/plugin-sdk'
import { WidgetEditorHost } from './WidgetEditorHost'

/**
 * The props of a widget's custom editor, shown in the widget dialog of the template editor. Changes are collected
 * through `onChange`, and written to the template when the dialog is saved.
 */
export interface WidgetEditorProps {
  /** The props as in the template, where values may be bound to data (see `Attribute.isDynamic`). */
  rawProps: Record<string, unknown>

  /** The evaluated props at the time the dialog was opened: values bound to data are filled in, defaults are not. */
  props: Record<string, unknown>

  /** The size the widget is previewed at, which can be changed in the dialog. */
  size: WidgetSize

  /** Reports all pending prop updates, keyed by prop name. An empty object means there are none. */
  onChange(updates: Record<string, unknown>): void

  host: WidgetEditorHost
}
