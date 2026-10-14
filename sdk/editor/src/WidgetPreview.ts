import { Size } from 'ytil'
import { WidgetEdit } from './WidgetEdit'
import { WidgetEditState } from './WidgetEditState'
import { WidgetEditorHost } from './WidgetEditorHost'

export interface WidgetPreview {
  update(state: WidgetPreviewState): void
  dispose(): void
}

export interface WidgetPreviewContext {
  host: WidgetEditorHost
  edit(edit: WidgetEdit): void
}

export interface WidgetPreviewState extends WidgetEditState {
  /** The size of the container on screen, where `size` is the size of the widget in the template. */
  displaySize: Size
}
