import { WidgetServerPlugin } from './WidgetServerPlugin'

export function defineServerPlugin<S>(plugin: WidgetServerPlugin<S>): WidgetServerPlugin<S> {
  return plugin
}
