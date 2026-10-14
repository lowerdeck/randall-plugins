import { GeoBounds, GeoPoint } from '../geo'

export interface GeocodeResult {
  label:  string
  center: GeoPoint
  bounds: GeoBounds | null
}
