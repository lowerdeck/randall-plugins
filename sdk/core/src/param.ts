import { z } from 'zod'
import { WidgetChoice } from './WidgetField'
import { WidgetParam, WidgetParamEdit, WidgetParams, WidgetProps } from './WidgetParam'
import { resolveParams } from './resolveParams'

/** Params with default schemas, and a field to edit them with. */
export namespace param {

  export function text(options: Common<string> & {multiline?: boolean}): WidgetParam<string> {
    const {multiline, ...rest} = options
    return {...rest, schema: z.coerce.string(), field: {type: 'text', multiline}}
  }

  export function number(options: Common<number> & {int?: boolean, min?: number, max?: number}): WidgetParam<number> {
    const {int, min, max, ...rest} = options

    let schema = z.coerce.number().refine(Number.isFinite, {message: 'Must be a number'})
    if (int) {
      schema = schema.refine(Number.isInteger, {message: 'Must be an integer'})
    }
    if (min != null) {
      schema = schema.refine(it => it >= min, {message: `Must be at least ${min}`})
    }
    if (max != null) {
      schema = schema.refine(it => it <= max, {message: `Must be at most ${max}`})
    }
    return {...rest, schema, field: {type: 'number', int, min, max}}
  }

  export function boolean(options: Common<boolean>): WidgetParam<boolean> {
    return {...options, schema: booleanSchema, field: {type: 'boolean'}}
  }

  /** Without a default, the choice can be cleared. */
  export function choice<V extends string, D extends V | null>(
    options: Common<D> & {choices: Array<WidgetChoice<V>>, grid?: boolean},
  ): WidgetParam<V | D> {
    const {choices, grid, ...rest} = options
    const values = choices.map(it => it.value) as [V, ...V[]]
    return {...rest, schema: z.enum(values).nullable() as z.ZodType<V | D>, field: {type: 'choice', choices, grid}}
  }

  /** A hex color. */
  export function color<D extends string | null>(options: Common<D>): WidgetParam<string | D> {
    return {...options, schema: colorSchema.nullable() as z.ZodType<string | D>, field: {type: 'color'}}
  }

  /** A list of items with params of their own. Empty items are dropped, and missing values get their defaults. */
  export function list<I extends WidgetParams>(
    options: Common<Array<WidgetProps<I>>> & {item: I, itemLabel: string},
  ): WidgetParam<Array<WidgetProps<I>>> {
    const {item, itemLabel, ...rest} = options
    const schema = z.array(z.unknown()).transform(items => items
      .filter(it => it != null && typeof it === 'object' && !Array.isArray(it))
      .map(it => resolveParams(item, it as Record<string, unknown>)),
    )
    return {...rest, schema, field: {type: 'list', item, itemLabel}}
  }

  /** A param with a schema of the plugin's own. Without a field, only the dialog's content can edit it. */
  export function custom<T>(options: Common<T> & {schema: z.ZodType<T>}): WidgetParam<T> {
    return {...options, edit: options.edit ?? 'content'}
  }

  interface Common<T> {
    label:   string
    default: T
    edit?:   WidgetParamEdit
    group?:  string
  }

}

const booleanSchema = z.union([
  z.boolean(),
  z.literal(0).transform(() => false),
  z.literal(1).transform(() => true),
  z.string().transform((value, ctx) => {
    const lower = value.trim().toLowerCase()
    if (lower === 'yes' || lower === 'true') { return true }
    if (lower === 'no' || lower === 'false') { return false }

    ctx.addIssue({code: 'custom', message: 'Invalid boolean'})
    return z.NEVER
  }),
])

const colorSchema = z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
