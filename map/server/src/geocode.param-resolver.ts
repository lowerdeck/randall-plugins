import { formatLocation, GeoPoint, geocodeQuery } from '@randall-plugins/map'
import { defineParamResolver, WidgetServerContext } from '@randall/plugin-sdk-server'
import { z } from 'zod'
import { cachedGeocode, cachedReverseGeocode } from './cachedGeocode'
import { MapSettings } from './settings'

// Defined first, as the resolver needs it when it's created.
const geocodeOptions = z.object({
  location_param: z.string().meta({param_type: 'text'}).optional(),
  name_param:     z.string().meta({param_type: 'text'}).optional(),
})

/**
 * Locates the param's value, like an address or "lat, lng", and fills in its location as "lat, lng", and the name of
 * the place there, which is looked up from the location.
 */
export const geocodeParamResolver = defineParamResolver<typeof geocodeOptions, MapSettings>({
  name:    'geocode',
  options: geocodeOptions,

  resolve: async (value, {location_param, name_param}, context) => {
    if (typeof value !== 'string') { return {} }
    if (location_param == null && name_param == null) { return {} }

    const point = await locate(value, context)
    if (point == null) { return {} }

    const values: Record<string, unknown> = {}
    if (location_param != null) {
      values[location_param] = formatLocation(point)
    }
    if (name_param != null) {
      const [place] = await cachedReverseGeocode(point, context)
      if (place != null) { values[name_param] = place.label }
    }
    return values
  },
})

async function locate(text: string, context: WidgetServerContext<MapSettings>): Promise<GeoPoint | null> {
  const query = geocodeQuery(text)
  if (query == null) { return GeoPoint.parse(text) }

  const [first] = await cachedGeocode(query, context)
  return first?.center ?? null
}
