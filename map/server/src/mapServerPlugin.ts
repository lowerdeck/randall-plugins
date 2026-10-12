import { defineServerPlugin, WidgetRequestError, WidgetServerContext } from '@randall/widget-sdk-server'
import { mapWidget, parseTilePath } from '@randall-widgets/map'
import { geocode, fetchTile } from './maptiler'
import { MapSettings, mapSettingsHandler, maptilerAPIKey } from './settings'
import { TileCache } from './TileCache'

export const mapServerPlugin = defineServerPlugin<MapSettings>({
  widget:   mapWidget,
  settings: mapSettingsHandler,

  resource: async (path, context) => {
    const parsed = parseTilePath(path)
    if (parsed == null) {
      throw new WidgetRequestError(404, `Unknown map resource "${path}"`)
    }

    const {style, tile} = parsed
    const key = requireAPIKey(context)

    // Keyed without the API key, which doesn't affect a tile's contents.
    return await tileCache.get(`${style}/${tile.z}/${tile.x}/${tile.y}`, () => fetchTile(key, style, tile))
  },

  query: async (name, params, context) => {
    switch (name) {
    case 'geocode': {
      const query = params.query?.trim() ?? ''
      if (query === '' || query.length > 256) {
        throw new WidgetRequestError(400, "Invalid query")
      }
      return await geocode(requireAPIKey(context), query)
    }
    default:
      throw new WidgetRequestError(404, `Unknown map query "${name}"`)
    }
  },
})

function requireAPIKey(context: WidgetServerContext<MapSettings>): string {
  const key = maptilerAPIKey(context.settings, context.secrets)
  if (key == null) {
    throw new WidgetRequestError(503, "Maps are not configured for this organisation")
  }
  return key
}

// Raster tiles are some 20-100kB each. Both the editor and renders re-request the same tiles a lot.
const tileCache = new TileCache<{data: Uint8Array, mimeType: string}>(2000)
