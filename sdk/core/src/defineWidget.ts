import { Widget } from './Widget'

export function defineWidget<P, R = undefined>(widget: Widget<P, R>): Widget<P, R> {
  return widget
}
