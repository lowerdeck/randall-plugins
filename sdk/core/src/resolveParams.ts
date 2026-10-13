import { WidgetParams, WidgetProps } from './WidgetParam'

/** The props to draw with: values that are missing or don't fit their param's schema get the param's default. */
export function resolveParams<Ps extends WidgetParams>(params: Ps, props: Record<string, unknown>): WidgetProps<Ps> {
  const resolved: Record<string, unknown> = {}
  for (const [name, param] of Object.entries(params)) {
    const value = props[name]
    if (value == null) {
      resolved[name] = param.default
      continue
    }

    const result = param.schema.safeParse(value)
    resolved[name] = result.success ? result.data : param.default
  }
  return resolved as WidgetProps<Ps>
}
