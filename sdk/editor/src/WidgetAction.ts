import { WidgetEdit } from './WidgetEdit'
import { WidgetEditState } from './WidgetEditState'

/** A button in the header of a fieldset, that edits the widget in one go. */
export interface WidgetAction {
  /** An i18next key in the plugin's locale. */
  label: string
  icon?: string

  enabled?(state: WidgetEditState): boolean
  apply(state: WidgetEditState): WidgetEdit
}
