import { Widget } from '@randall/plugin-sdk'
import { WidgetServerContext } from './WidgetServerContext'
import { WidgetSettingsHandler } from './WidgetSettingsHandler'

/**
 * The server part of a widget. The backend serves its resources and queries under `/widgets/<name>/…`, and uses it
 * to render the widget's frames.
 */
export interface WidgetServerPlugin<S = any> {
  widget: Widget

  settings?: WidgetSettingsHandler<S>

  /** Serves a resource that the widget loads while preparing, like a map tile. */
  resource?(path: string, context: WidgetServerContext<S>): Promise<WidgetResource>

  /** Answers a query from the widget's editor, like a geocoding search. */
  query?(name: string, params: Record<string, string>, context: WidgetServerContext<S>): Promise<unknown>
}

export interface WidgetResource {
  data:     Uint8Array
  mimeType: string
}
