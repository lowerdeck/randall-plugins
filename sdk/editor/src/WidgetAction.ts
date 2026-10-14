import { WidgetEdit } from './WidgetEdit'
import { WidgetEditState } from './WidgetEditState'

/** A button in the dialog's toolbar, next to the search bar, that edits the widget in one go. */
export interface WidgetAction {
  label: string
  icon?: string

  enabled?(state: WidgetEditState): boolean
  apply(state: WidgetEditState): WidgetEdit
}
