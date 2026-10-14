import { WidgetParam } from './WidgetParam'

/** A list of params by their names, as widgets and objects look them up. */
export function namedParams<const Ps extends WidgetParamList>(params: Ps): NamedParams<Ps> {
  return Object.fromEntries(params.map(it => [it.name, it])) as NamedParams<Ps>
}

export type WidgetParamList = readonly WidgetParam<any>[]

export type NamedParams<Ps extends WidgetParamList> = {
  [P in Ps[number] as P['name']]: P
}
