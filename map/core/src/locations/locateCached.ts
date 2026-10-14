import { GeoPoint } from '../geo'
import { geocoded } from './geocodeCache'
import { geocodeQuery } from './geocodeQuery'

/** The location of a text, if it's "lat, lng" or has been geocoded already. See `locateAll`. */
export function locateCached(text: string): GeoPoint | null {
  const query = geocodeQuery(text)
  return query == null ? GeoPoint.parse(text) : geocoded(query) ?? null
}
