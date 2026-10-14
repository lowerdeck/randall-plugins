import { GeoPoint } from '../geo'

/** What to geocode for a location text: nothing for "lat, lng" or an empty text. */
export function geocodeQuery(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed === '' || trimmed.length > MAX_QUERY_LENGTH) { return null }
  return GeoPoint.parse(trimmed) == null ? trimmed : null
}

export const MAX_QUERY_LENGTH = 256
