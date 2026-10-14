import { WidgetAction } from './WidgetAction'
import { WidgetParamEditor } from './WidgetParamEditor'
import { WidgetPreview, WidgetPreviewContext, WidgetPreviewState } from './WidgetPreview'
import { WidgetSearch } from './WidgetSearch'

/**
 * How a widget is edited in its dialog in the template editor. The dialog itself is the same for every widget: it
 * shows fields for the `dialog` params, an optional search bar, and the content, at the widget's aspect ratio. The
 * content is up to the widget, and defaults to a preview of how it draws.
 */
export interface WidgetEditor {
  preview: WidgetPreviewFactory<WidgetPreview>

  search?:          WidgetSearch
  paramEditors?:    Record<string, WidgetParamEditor>
  fieldsetActions?: Record<string, WidgetAction[]>
}

export type WidgetPreviewFactory<P extends WidgetPreview> = (
  container: HTMLElement,
  context: WidgetPreviewContext,
  state: WidgetPreviewState,
) => P