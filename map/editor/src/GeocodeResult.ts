import { GeoBounds, GeoPoint } from 'templates'

export interface GeocodeResult {
  label:  string
  center: GeoPoint
  bounds: GeoBounds | null
}
