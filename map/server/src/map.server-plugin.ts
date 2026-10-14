import { mapWidget, parseTilePath } from '@randall-plugins/map'
import { defineServerPlugin, WidgetRequestError } from '@randall/plugin-sdk-server'
import { TileCache } from './TileCache'
import { cachedGeocode } from './cachedGeocode'
import { geocodeParamResolver } from './geocode.param-resolver'
import { fetchTile } from './maptiler'
import { requireAPIKey } from './requireAPIKey'
import { MapSettings, mapSettingsHandler } from './settings'

export const mapServerPlugin = defineServerPlugin<MapSettings>({
  widget:         mapWidget,
  settings:       mapSettingsHandler,
  paramResolvers: [geocodeParamResolver],

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
      return await cachedGeocode(query, context)
    }
    default:
      throw new WidgetRequestError(404, `Unknown map query "${name}"`)
    }
  },
})

// Raster tiles are some 20-100kB each. Both the editor and renders re-request the same tiles a lot.
const tileCache = new TileCache<{data: Uint8Array, mimeType: string}>(2000)
