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
