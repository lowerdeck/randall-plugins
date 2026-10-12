import { WidgetSettingField } from './WidgetSettingField'

export interface WidgetSettings<S = any> {
  fields: WidgetSettingField[]

  /** Whether organisations can use the widget with these settings, e.g. because a provider is configured. */
  isEnabled(settings: S): boolean

  /** The settings that turn the widget off. */
  disabled: S
}
