import { GeoPoint } from 'templates'

// Web-mercator projection into normalized world coordinates: [0, 1] on both axes, origin top-left.
export function project(point: GeoPoint): [number, number] {
  const lat = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, point.lat))
  const sin = Math.sin(lat * Math.PI / 180)

  const x = (point.lng + 180) / 360
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
  return [x, y]
}

export function unproject([x, y]: [number, number]): GeoPoint {
  const lng = x * 360 - 180
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180 / Math.PI
  return {lat, lng}
}

// The size of the whole world in pixels at the given zoom. We use the 512px tile convention (as MapLibre / Mapbox GL).
export function worldSize(zoom: number): number {
  return TILE_SIZE * 2 ** zoom
}

export const TILE_SIZE = 512
export const MAX_LATITUDE = 85.0511287798
