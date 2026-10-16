import { WidgetSettings } from '@randall/plugin-sdk'

// Maps are optional: without a provider, the map widget is not available.
export const mapSettings: WidgetSettings<{provider: string}> = {
  isEnabled: settings => settings.provider === 'maptiler',
  disabled:  {provider: 'none'},
  fields:    [
    {
      type:    'choice',
      name:    'provider',
      label:   'settings.provider.caption',
      choices: [
        {value: 'none', label: 'settings.provider.none'},
        {value: 'maptiler', label: 'settings.provider.maptiler'},
      ],
    },
    {type: 'text', name: 'api_key', label: 'settings.api_key.caption', secret: true, visibleIf: {provider: 'maptiler'}},
  ],
}
