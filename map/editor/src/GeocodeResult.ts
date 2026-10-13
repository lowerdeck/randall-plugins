import { GeoBounds, GeoPoint } from '@randall-plugins/map'

export interface GeocodeResult {
  label:  string
  center: GeoPoint
  bounds: GeoBounds | null
}
