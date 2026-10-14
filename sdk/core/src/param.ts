import { z } from 'zod'
import {
  BooleanField,
  ChoiceField,
  ChoiceFieldVariant,
  ColorField,
  ListField,
  NumberField,
  TextField,
  WidgetChoice,
  WidgetField,
} from './WidgetField'
import { namedParams, NamedParams, WidgetParamList } from './namedParams'
import { WidgetParam, WidgetParamEdit, WidgetProps } from './WidgetParam'
import { resolveParams } from './resolveParams'

export namespace param {

  export function text<const N extends string>(name: N, props: WidgetParamOptions<string> & WidgetFieldOptions<TextField>): WidgetParam<string, N> {
    const [options, field] = partitionProps<string, WidgetFieldOptions<TextField>>(props)

    let schema = z.string()
    if (field.minLength != null) {
      schema = schema.min(field.minLength)
    }
    if (field.maxLength != null) {
      schema = schema.max(field.maxLength)
    }
    return {
      name:   name,
      schema: schema,
      field:  {type: 'text', ...field},
      ...options,
    }
  }

  export function number<const N extends string>(name: N, props: WidgetParamOptions<number> & WidgetFieldOptions<NumberField>): WidgetParam<number, N> {
    const [options, field] = partitionProps<number, WidgetFieldOptions<NumberField>>(props)

    let schema = z.coerce.number().refine(Number.isFinite, {message: 'Must be a number'})
    if (field.int) {
      schema = schema.int()
    }
    if (field.min != null) {
      schema = schema.min(field.min)
    }
    if (field.max != null) {
      schema = schema.max(field.max)
    }
    return {
      name:   name,
      schema: schema,
      field:  {type: 'number', ...field},
      ...options,
    }
  }

  export function boolean<const N extends string>(name: N, props: WidgetParamOptions<boolean> & WidgetFieldOptions<BooleanField>): WidgetParam<boolean, N> {
    const [options, field] = partitionProps<boolean, WidgetFieldOptions<BooleanField>>(props)
    return {
      name:   name,
      schema: z.boolean(),
      field:  {type: 'boolean', ...field},
      ...options,
    }
  }

  /** Without a default, the choice can be cleared. */
  export function choice<const N extends string, V extends string, D extends V | null>(name: N, props: WidgetParamOptions<D> & ChoiceOptions<V>): WidgetParam<V | D, N> {
    const [options, field] = partitionProps<D, ChoiceOptions<V>>(props)
    const values = field.choices.map(it => it.value) as [V, ...V[]]
    return {
      name:   name,
      schema: z.enum(values).nullable() as z.ZodType<V | D>,
      field:  {type: 'choice', variant: ChoiceFieldVariant.Select, ...field},
      ...options,
    }
  }

  /** A hex color. */
  export function color<const N extends string, D extends string | null>(name: N, props: WidgetParamOptions<D> & WidgetFieldOptions<ColorField>): WidgetParam<string | D, N> {
    const [options, field] = partitionProps<D, WidgetFieldOptions<ColorField>>(props)
    const schema = field.alpha ? colorAlphaSchema : colorSchema
    return {
      name:   name,
      schema: schema.nullable() as z.ZodType<string | D>,
      field:  {type: 'color', ...field},
      ...options,
    }
  }

  /** Empty items are dropped, and invalid ones get the item's default. */
  export function array<const N extends string, T>(name: N, props: ArrayOptions<T>): WidgetParam<T[], N> {
    const [options, field] = partitionProps<T[], ArrayOptions<T>>(props)
    const schema = z.array(z.unknown()).transform(items => items
      .filter(it => it != null)
      .map(it => {
        const result = field.item.schema.safeParse(it)
        return result.success ? result.data : field.item.default
      }),
    )
    return {
      name:   name,
      schema: schema,
      field:  {type: 'list', ...field},
      ...options,
    }
  }

  /** Missing values get their defaults, which is also the default of the whole object. */
  export function object<const N extends string, const Ps extends WidgetParamList>(
    name: N,
    props: ObjectOptions<Ps>,
  ): WidgetParam<WidgetProps<NamedParams<Ps>>, N> {
    const {default: _default, params: list, ...rest} = props
    const params = namedParams(list)
    const [options, field] = partitionProps<WidgetProps<NamedParams<Ps>>, object>({
      ...rest,
      default: _default ?? resolveParams(params, {}),
    })

    const schema = z.record(z.string(), z.unknown()).transform(raw => resolveParams(params, raw))
    return {
      name:   name,
      schema: schema,
      field:  {type: 'nested', params, ...field},
      ...options,
    }
  }

  /** A param with a schema of the plugin's own. Without a field, only the dialog's content can edit it. */
  export function custom<const N extends string, T>(name: N, options: WidgetParamOptions<T> & {schema: z.ZodType<T>}): WidgetParam<T, N> {
    return {name, ...options, edit: options.edit ?? 'content'}
  }

}

function partitionProps<T, O extends object>(props: WidgetParamOptions<T> & O): [WidgetParamOptions<T>, Omit<O, keyof WidgetParamOptions<T>>] {
  const {
    default: _default,
    edit,
    visible,
    ...field
  } = props

  const options = {
    default: _default,
    edit,
    visible,
  }

  return [options, field]
}

export interface WidgetParamOptions<T> {
  default:  T
  edit?:    WidgetParamEdit
  visible?: (values: Record<string, unknown>) => boolean
}

export type WidgetFieldOptions<F extends WidgetField> = Omit<F, 'type'>

type ChoiceOptions<V extends string> = Omit<WidgetFieldOptions<ChoiceField>, 'choices' | 'variant'> & {
  choices:  Array<WidgetChoice<V>>
  variant?: ChoiceFieldVariant
}

export type ArrayOptions<T> = WidgetParamOptions<T[]> & WidgetFieldOptions<ListField<T>>

type ObjectOptions<Ps extends WidgetParamList> =
  & Omit<WidgetParamOptions<WidgetProps<NamedParams<Ps>>>, 'default'>
  & Partial<Pick<WidgetParamOptions<WidgetProps<NamedParams<Ps>>>, 'default'>>
  & {params: Ps}

const colorSchema = z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i)
const colorAlphaSchema = z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
