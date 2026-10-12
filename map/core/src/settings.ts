import { WidgetSettings } from '@randall/widget-sdk'

// Maps are optional: without a provider, the map widget is not available.
export const mapSettings: WidgetSettings<{provider: string}> = {
  isEnabled: settings => settings.provider === 'maptiler',
  disabled:  {provider: 'none'},
  fields:    [
    {type: 'choice', name: 'provider', label: 'Provider', choices: [
      {value: 'none', label: 'None'},
      {value: 'maptiler', label: 'MapTiler'},
    ]},
    {type: 'text', name: 'api_key', label: 'API key', secret: true, visibleIf: {provider: 'maptiler'}},
  ],
}
