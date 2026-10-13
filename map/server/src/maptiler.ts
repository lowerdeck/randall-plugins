import { WidgetRequestError, WidgetSettingsError } from '@randall/plugin-sdk-server'
import { MapStyle, mapStyle, mapStyles, TileCoord, tileURL } from '@randall-plugins/map'
import { GeocodingResult, parseGeocodingResults } from './geocodingResult'

/**
 * A raster tile URL template with `{z}`, `{x}` and `{y}` placeholders. It contains the API key, so don't log it.
 */
export function tileURLTemplate(apiKey: string, styleId: string): string {
  const style = resolveStyle(styleId)
  return `${baseURL}/maps/${style.id}/{z}/{x}/{y}.${style.format}?key=${encodeURIComponent(apiKey)}`
}

export async function fetchTile(apiKey: string, styleId: string, tile: TileCoord): Promise<MapTile> {
  const count = 2 ** tile.z
  if (tile.z > 22 || tile.x >= count || tile.y >= count) {
    throw new WidgetRequestError(400, `Tile ${tile.x},${tile.y} is out of range at zoom ${tile.z}`)
  }

  const style = resolveStyle(styleId)
  const response = await fetch(tileURL(tileURLTemplate(apiKey, style.id), tile))
  if (!response.ok) {
    throw upstreamError(response.status)
  }

  return {
    data:     new Uint8Array(await response.arrayBuffer()),
    mimeType: response.headers.get('Content-Type') ?? fallbackMimeTypes[style.format],
  }
}

export async function geocode(apiKey: string, query: string): Promise<GeocodingResult[]> {
  const url = new URL(`${baseURL}/geocoding/${encodeURIComponent(query)}.json`)
  url.searchParams.set('key', apiKey)
  url.searchParams.set('limit', `${geocodingLimit}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw upstreamError(response.status)
  }
  return parseGeocodingResults(await response.json())
}

/**
 * Tries out a key by fetching the tile of the whole world.
 */
export async function testAPIKey(apiKey: string): Promise<void> {
  const response = await fetch(tileURL(tileURLTemplate(apiKey, mapStyles[0].id), {z: 0, x: 0, y: 0}))
  if (!response.ok) {
    throw new WidgetSettingsError(response.status === 403 ? "MapTiler rejected the API key" : `MapTiler responded with status ${response.status}`)
  }
}

export interface MapTile {
  data:     Uint8Array
  mimeType: string
}

function resolveStyle(styleId: string): MapStyle {
  const style = mapStyle(styleId)
  if (style == null) {
    throw new WidgetRequestError(400, `Unknown map style "${styleId}"`)
  }
  return style
}

// Upstream messages are not passed on, as they could mention the key.
function upstreamError(status: number): WidgetRequestError {
  switch (status) {
  case 404: return new WidgetRequestError(404, "Map tile not found")
  case 429: return new WidgetRequestError(429, "MapTiler rate limit exceeded")
  default: return new WidgetRequestError(502, `MapTiler responded with status ${status}`)
  }
}

const baseURL = 'https://api.maptiler.com'
const geocodingLimit = 6

const fallbackMimeTypes: Record<MapStyle['format'], string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
}
