import { WidgetSecrets, WidgetSettingsError, WidgetSettingsHandler } from '@randall/widget-sdk-server'
import { z } from 'zod'
import { testAPIKey } from './maptiler'

export const mapSettingsHandler: WidgetSettingsHandler<MapSettings> = {
  default: {provider: 'none'},
  parse:   stored => mapSettings.parse(stored),

  publicView: (settings, secrets) => {
    switch (settings.provider) {
    case 'none': return settings
    case 'maptiler': return {provider: 'maptiler', api_key: secrets.mask(secrets.decrypt(settings.api_key))}
    }
  },

  // A key that is left out, or sent back masked, is kept.
  update: (current, raw, secrets) => {
    const parsed = mapSettingsUpdate.safeParse(raw)
    if (!parsed.success) {
      throw new WidgetSettingsError(`Invalid map settings: ${parsed.error.issues[0]?.message}`)
    }

    const update = parsed.data
    switch (update.provider) {
    case 'none':
      return {provider: 'none'}
    case 'maptiler': {
      const key = update.api_key
      if (key == null || secrets.isMasked(key)) {
        if (current.provider !== 'maptiler') {
          throw new WidgetSettingsError("An API key is required for MapTiler")
        }
        return current
      }
      return {provider: 'maptiler', api_key: secrets.encrypt(key)}
    }
    }
  },

  test: async (settings, secrets) => {
    const key = maptilerAPIKey(settings, secrets)
    if (key == null) { return }
    await testAPIKey(key)
  },
}

export function maptilerAPIKey(settings: MapSettings, secrets: WidgetSecrets): string | null {
  if (settings.provider !== 'maptiler') { return null }
  return secrets.decrypt(settings.api_key)
}

// Credentials are stored encrypted.
export const mapSettings = z.discriminatedUnion('provider', [
  z.object({provider: z.literal('none')}),
  z.object({provider: z.literal('maptiler'), api_key: z.string()}),
])

export type MapSettings = z.infer<typeof mapSettings>

const mapSettingsUpdate = z.discriminatedUnion('provider', [
  z.object({provider: z.literal('none')}),
  z.object({provider: z.literal('maptiler'), api_key: z.string().trim().min(1).max(256).optional()}),
])
