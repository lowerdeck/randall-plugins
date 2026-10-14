import { WidgetHost } from '@randall/plugin-sdk'
import { GeoPoint } from '../geo'
import { geocodeOnce } from './geocodeCache'
import { geocodeQuery } from './geocodeQuery'
import { locateCached } from './locateCached'

/**
 * Locates texts like the map's center and the locations of its markers: "lat, lng" as it is, and anything else as the
 * first result of geocoding it. A text is geocoded only once, also when several locations are (bound to) the same.
 * Texts that can't be geocoded are reported, and left without a location.
 */
export async function locateAll(texts: string[], host: GeocodeHost, reportError: (error: unknown) => void): Promise<Locate> {
  const queries = new Set(texts.map(geocodeQuery).filter(it => it != null))
  await Promise.all([...queries].map(async query => {
    try {
      await geocodeOnce(query, host)
    } catch (error) {
      reportError(error)
    }
  }))
  return locateCached
}

export type Locate = (text: string) => GeoPoint | null

export type GeocodeHost = Pick<WidgetHost, 'query'>
