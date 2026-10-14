import { GeoPoint } from '../geo'

/** A point as a location text, "lat, lng", to about 10 cm. */
export function formatLocation(point: GeoPoint): string {
  return `${round(point.lat)}, ${round(point.lng)}`
}

function round(coordinate: number) {
  return Math.round(coordinate * 1e6) / 1e6
}
