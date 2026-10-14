import { WidgetAction } from './WidgetAction'
import { WidgetContent } from './WidgetContent'
import { WidgetParamEditor } from './WidgetParamEditor'
import { WidgetSearch } from './WidgetSearch'

/**
 * How a widget is edited in its dialog in the template editor. The dialog itself is the same for every widget: it
 * shows fields for the `dialog` params, an optional search bar, and the content, at the widget's aspect ratio. The
 * content is up to the widget, and defaults to a preview of how it draws.
 */
export interface WidgetEditor {
  search?:  WidgetSearch
  content?: WidgetContent
  actions?: WidgetAction[]

  /** Extras for how params are edited, by param name. Each must fit its param's field, which is checked on loading. */
  paramEditors?: Record<string, WidgetParamEditor>
}
