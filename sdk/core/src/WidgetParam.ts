import { z } from 'zod'
import { WidgetField } from './WidgetField'

/**
 * A param of a widget: a prop that templates can set. Its schema is the single definition of a valid value, used when
 * editing as well as when rendering. See `param` for params with default schemas; plugins can make any other.
 */
export interface WidgetParam<T = unknown> {
  label:   string
  schema:  z.ZodType<T>
  default: T

  /** How it's edited in the panel or dialog. Params without one can only be edited by the dialog's content. */
  field?: WidgetField
  edit?:  WidgetParamEdit

  /** The fieldset in the properties panel, which defaults to the widget's label. */
  group?: string
}

export type WidgetParams = Record<string, WidgetParam<any>>

/** The props that a widget draws with, given its params. */
export type WidgetProps<Ps extends WidgetParams> = {
  [K in keyof Ps]: Ps[K] extends WidgetParam<infer T> ? T : never
}

/**
 * Where a param is edited:
 *
 * - `panel`: in the properties panel of the template editor (the default for params with a field).
 * - `dialog`: as a field in the widget's dialog.
 * - `content`: only through the content of the widget's dialog, like dragging a map around (the default otherwise).
 */
export type WidgetParamEdit = 'panel' | 'dialog' | 'content'

export function paramEdit(param: WidgetParam): WidgetParamEdit {
  return param.edit ?? (param.field == null ? 'content' : 'panel')
}
