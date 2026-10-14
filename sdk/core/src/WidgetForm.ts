import { NamedParams, WidgetParamList } from './namedParams'
import { WidgetParam } from './WidgetParam'

/** How a widget's params are laid out in its forms. See `form`. */
export type WidgetForm = readonly WidgetFormSection[]

export type WidgetFormSection =
  | WidgetHiddenParams
  | WidgetFieldset
  | WidgetRepeaterFieldset

export interface WidgetHiddenParams<Ps extends WidgetParamList = WidgetParamList> {
  type:   'hidden'
  params: Ps
}

export interface WidgetFieldset<Ps extends WidgetParamList = WidgetParamList> {
  type:   'fieldset'
  name:   string
  params: Ps
}

export interface WidgetRepeaterFieldset<P extends WidgetParam<any[]> = WidgetParam<any[]>> {
  type:  'repeater'
  param: P
}

/** All params of a form, by name. */
export function formParams<F extends WidgetForm>(form: F): FormParams<F> {
  return Object.fromEntries(form.flatMap(sectionParams).map(it => [it.name, it])) as FormParams<F>
}

export function sectionParams(section: WidgetFormSection): WidgetParamList {
  return section.type === 'repeater' ? [section.param] : section.params
}

export type FormParams<F extends WidgetForm> = NamedParams<Array<SectionParam<F[number]>>>

type SectionParam<S> =
  S extends {params: infer Ps extends WidgetParamList} ? Ps[number] :
  S extends {param: infer P extends WidgetParam<any>} ? P :
  never
