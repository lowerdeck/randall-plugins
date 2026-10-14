import { ArrayOptions, param } from './param'
import { WidgetParamList } from './namedParams'
import { WidgetFieldset, WidgetHiddenParams, WidgetRepeaterFieldset } from './WidgetForm'

/** The sections of a widget's form. Captions of fieldsets are in the plugin's locale, like `fieldsets.map.caption`. */
export namespace form {

  /** Params that only the dialog's content edits, like the view of a map. */
  export function hidden<const Ps extends WidgetParamList>(params: Ps): WidgetHiddenParams<Ps> {
    return {type: 'hidden', params: params.map(it => ({...it, edit: 'content'})) as unknown as Ps}
  }

  export function fieldset<const Ps extends WidgetParamList>(name: string, params: Ps): WidgetFieldset<Ps> {
    return {type: 'fieldset', name, params}
  }

  /** A list param, with a fieldset for each item. */
  export function repeaterFieldset<const N extends string, T>(name: N, options: ArrayOptions<T>) {
    return {type: 'repeater', param: param.array(name, options)} satisfies WidgetRepeaterFieldset
  }

}
