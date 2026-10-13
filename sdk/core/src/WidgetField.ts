import { WidgetParams } from './WidgetParam'

export type WidgetField =
  | {type: 'text', multiline?: boolean}
  | {type: 'number', int?: boolean, min?: number, max?: number}
  | {type: 'boolean'}
  | {type: 'choice', choices: WidgetChoice[], grid?: boolean}
  | {type: 'color'}
  | {type: 'list', item: WidgetParams, itemLabel: string}

export interface WidgetChoice<V extends string = string> {
  value:  V
  label:  string
  glyph?: WidgetGlyph
}

/** A small single-color image, as SVG path data in a square view box. */
export interface WidgetGlyph {
  path:    string
  viewBox: number
}
