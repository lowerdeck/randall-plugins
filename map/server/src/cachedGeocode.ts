import { GeoPoint } from '@randall-plugins/map'
import { WidgetServerContext } from '@randall/plugin-sdk-server'
import { GeocodingResult } from './geocodingResult'
import { geocode, reverseGeocode } from './maptiler'
import { requireAPIKey } from './requireAPIKey'
import { MapSettings } from './settings'
import { TileCache } from './TileCache'

/**
 * Geocodes a query, keeping the results, as previews, renders and resolving params look up the same addresses over
 * and over.
 */
export async function cachedGeocode(query: string, context: WidgetServerContext<MapSettings>): Promise<GeocodingResult[]> {
  const key = requireAPIKey(context)
  return await geocodeCache.get(query.toLowerCase(), () => geocode(key, query))
}

/** Like `cachedGeocode`, for the places at a point. */
export async function cachedReverseGeocode(point: GeoPoint, context: WidgetServerContext<MapSettings>): Promise<GeocodingResult[]> {
  const key = requireAPIKey(context)
  return await reverseGeocodeCache.get(`${point.lat},${point.lng}`, () => reverseGeocode(key, point))
}

const geocodeCache = new TileCache<GeocodingResult[]>(1000)
const reverseGeocodeCache = new TileCache<GeocodingResult[]>(1000)
