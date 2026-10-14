import { WidgetEdit } from './WidgetEdit'
import { WidgetEditState } from './WidgetEditState'

export interface WidgetListEditor {
  type: 'list'

  /** A new item, if the defaults of the item params won't do. */
  newItem?(state: WidgetEditState): Record<string, unknown>

  /** Extra buttons for each item. */
  actions?: WidgetItemAction[]
}

export interface WidgetItemAction {
  /** An i18next key in the plugin's locale. */
  label: string
  icon?: string

  enabled?(state: WidgetEditState, itemPath: string): boolean
  apply(state: WidgetEditState, itemPath: string): WidgetEdit
}
