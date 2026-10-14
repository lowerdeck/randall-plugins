import { GeoPoint } from '../geo'
import { GeocodeResult } from './GeocodeResult'
import type { GeocodeHost } from './locateAll'

/**
 * Geocodes a query to its first result, sharing lookups that are in flight. Results are kept, as previews and renders
 * locate the same texts over and over. Failures aren't, so that they're tried again.
 */
export async function geocodeOnce(query: string, host: GeocodeHost): Promise<GeoPoint | null> {
  const key = cacheKey(query)
  if (results.has(key)) { return results.get(key)! }

  let pending = inflight.get(key)
  if (pending == null) {
    pending = geocode(query, host)
    inflight.set(key, pending)
  }

  try {
    const point = await pending
    store(key, point)
    return point
  } finally {
    inflight.delete(key)
  }
}

/** The result of a query that was geocoded, `null` if it had none, or `undefined` if it hasn't been geocoded. */
export function geocoded(query: string): GeoPoint | null | undefined {
  return results.get(cacheKey(query))
}

async function geocode(query: string, host: GeocodeHost): Promise<GeoPoint | null> {
  const [first] = await host.query<GeocodeResult[]>('geocode', {query})
  return first?.center ?? null
}

function store(key: string, point: GeoPoint | null) {
  results.set(key, point)
  while (results.size > CAPACITY) {
    results.delete(results.keys().next().value!)
  }
}

function cacheKey(query: string) {
  return query.trim().toLowerCase()
}

const results = new Map<string, GeoPoint | null>()
const inflight = new Map<string, Promise<GeoPoint | null>>()

const CAPACITY = 500
