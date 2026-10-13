import { resolveParams } from './resolveParams'
import { Widget } from './Widget'
import { WidgetParams, WidgetProps } from './WidgetParam'

export function defineWidget<Ps extends WidgetParams, R = undefined>(
  widget: Omit<Widget<WidgetProps<Ps>, R>, 'params' | 'resolveProps'> & {params: Ps},
): Widget<WidgetProps<Ps>, R> {
  return {
    ...widget,
    resolveProps: raw => resolveParams(widget.params, raw),
  }
}
