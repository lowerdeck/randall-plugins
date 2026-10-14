import { ReactNode } from 'react'
import { WidgetParam, WidgetParams } from './WidgetParam'

export type WidgetField =
  | TextField
  | NumberField
  | BooleanField
  | ChoiceField
  | ColorField
  | ListField
  | NestedField
  | CompoundField

export interface TextField {
  type: 'text'
  multiline?: boolean
  minLength?: number
  maxLength?: number
}

export interface NumberField {
  type: 'number'
  int?: boolean
  min?: number
  max?: number
  /** What the steppers add, and what values are rounded to: 1 by default, or `false` for neither. */
  step?: number | false
}

export interface BooleanField {
  type: 'boolean'
}

export interface ChoiceField {
  type: 'choice'
  choices: WidgetChoice[]
  variant: ChoiceFieldVariant
}

export interface WidgetChoice<V extends string = string> {
  value:   V
  /** An i18next key in the plugin's locale. */
  label:   string
  render?: () => ReactNode
}

export enum ChoiceFieldVariant {
  Select,
  ToggleButtons,
  Grid,
}

export interface ColorField {
  type: 'color'
  alpha?: boolean
  presets?: string[]
}

export interface NestedField<Ps extends WidgetParams = WidgetParams> {
  type:   'nested'
  params: Ps
}

export interface ListField<T = any> {
  type:      'list'
  item:      WidgetParam<T>
  /** An i18next key in the plugin's locale. */
  itemLabel: string
}

/**
 * A single value made up of parts, like a location of a latitude and a longitude. It's edited with a field for each
 * part, and bound to data as a whole.
 */
export interface CompoundField {
  type:  'compound'
  parts: CompoundFieldPart[]

  /** What the parts start from while the value is empty. */
  blank: Record<string, unknown>
}

export interface CompoundFieldPart {
  key:   string
  /** An i18next key in the plugin's locale. */
  label: string
  field: TextField | NumberField
}
