import { z } from 'zod'
import { WidgetServerContext } from './WidgetServerContext'

/**
 * A param resolver: fills in params of a template from the value of the param that it's on, like the coordinates of
 * an address. Templates refer to it as `<widget>:<name>`, like `map:geocode`.
 *
 * Options that name a param to fill in are marked with the type of param it should be, like
 * `z.string().meta({param_type: 'text'})`, so that the template editor offers params of that type. Labels go in the
 * plugin's locale, under `resolvers.<name>.label`, `.detail`, and `.fields.<option>`.
 */
export interface PluginParamResolver<O extends z.ZodObject = z.ZodObject, S = any> {
  name:    string
  options: O

  /** The values of the params to fill in, by name. Params that already have a value are left alone. */
  resolve(value: unknown, options: z.output<O>, context: WidgetServerContext<S>): Promise<Record<string, unknown>>
}

export function defineParamResolver<O extends z.ZodObject, S = any>(resolver: PluginParamResolver<O, S>): PluginParamResolver<O, S> {
  return resolver
}
