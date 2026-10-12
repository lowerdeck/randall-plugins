import { GeoPoint } from 'templates'
import { ShapeName } from './marker/shapes'

export interface MapMarker {
  location: GeoPoint | null
  color:    string
  size:     number

  // The name of a shape from `shapes`, drawn inside the pin.
  icon: ShapeName | null
}

export namespace MapMarker {

  export function create(location: GeoPoint | null, overrides: Partial<MapMarker> = {}): MapMarker {
    return {...defaults, location, ...overrides}
  }

  export function resolve(raw: Partial<MapMarker>): MapMarker {
    const marker = {...defaults, location: null}
    for (const [key, value] of Object.entries(raw)) {
      if (value != null) { Object.assign(marker, {[key]: value}) }
    }
    return marker
  }

  export const defaults = {
    color: '#E53935',
    size:  48,
    icon:  null,
  } satisfies Omit<MapMarker, 'location'>

}
