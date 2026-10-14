/**
 * A field in the settings form of a widget. Secret values are only ever shown masked. Labels are i18next keys in the
 * plugin's locale.
 */
export type WidgetSettingField =
  | {type: 'choice', name: string, label: string, choices: Array<{value: string, label: string}>}
  | {type: 'text', name: string, label: string, secret?: boolean, visibleIf?: Record<string, string>}
