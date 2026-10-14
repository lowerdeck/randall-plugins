import { resolveParams } from './resolveParams'
import { Widget } from './Widget'
import { FormParams, formParams, WidgetForm } from './WidgetForm'
import { WidgetProps } from './WidgetParam'

export function defineWidget<F extends WidgetForm, R = undefined>(
  widget: Omit<Widget<WidgetProps<FormParams<F>>, R>, 'form' | 'params' | 'resolveProps'> & {form: F},
): Widget<WidgetProps<FormParams<F>>, R> {
  const params = formParams(widget.form)
  return {
    ...widget,
    params:       params,
    resolveProps: raw => resolveParams(params, raw),
  }
}
