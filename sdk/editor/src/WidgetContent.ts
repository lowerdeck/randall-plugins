import { WidgetSize } from '@randall/plugin-sdk'
import { WidgetEdit } from './WidgetEdit'
import { WidgetEditorHost } from './WidgetEditorHost'
import { WidgetEditState } from './WidgetEditState'

/**
 * The content of the widget's dialog, built with plain DOM in a container that the dialog sizes to the widget's aspect
 * ratio. It's controlled: it shows the state it's given, and reports what the user does as edits, which come back in
 * the next update.
 */
export interface WidgetContent {
  mount(container: HTMLElement, context: WidgetContentContext, state: WidgetContentState): WidgetContentInstance
}

export interface WidgetContentInstance {
  /** Called whenever anything in the state changes. */
  update(state: WidgetContentState): void
  dispose(): void
}

export interface WidgetContentContext {
  host: WidgetEditorHost
  edit(edit: WidgetEdit): void
}

export interface WidgetContentState extends WidgetEditState {
  /** The size of the container on screen, where `size` is the size of the widget in the template. */
  displaySize: WidgetSize
}
