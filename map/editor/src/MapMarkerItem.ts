import { isEqual } from 'lodash'
import { MapMarker } from '@randall-widgets/map'
import { Attribute, GeoPoint } from 'templates'

// A marker as edited in the map dialog: its evaluated look and location with the dialog's edits applied, and the raw
// spec entry it came from, which is written back with only the edited fields replaced.
export interface MapMarkerItem {
  raw:      unknown
  marker:   MapMarker
  location: GeoPoint | null
  edits:    Partial<MapMarker>
}

export namespace MapMarkerItem {

  export function fromSpec(raw: unknown, evaluated: unknown): MapMarkerItem {
    const marker = MapMarker.resolve(isRecord(evaluated) ? evaluated : {})
    return {
      raw,
      marker,
      location: GeoPoint.is(marker.location) ? marker.location : null,
      edits:    {},
    }
  }

  export function create(location: GeoPoint): MapMarkerItem {
    const marker = MapMarker.create(location)
    return {raw: null, marker, location, edits: {}}
  }

  export function isLocked(item: MapMarkerItem, field: keyof MapMarker) {
    return Attribute.isDynamic(item.raw) || (isRecord(item.raw) && Attribute.isDynamic(item.raw[field]))
  }

  export function update<K extends keyof MapMarker>(item: MapMarkerItem, field: K, value: MapMarker[K]): MapMarkerItem {
    if (isLocked(item, field)) { return item }

    return {
      ...item,
      marker:   {...item.marker, [field]: value},
      location: field === 'location' ? value as GeoPoint | null : item.location,
      edits:    {...item.edits, [field]: value},
    }
  }

  export function toSpec(item: MapMarkerItem): unknown {
    if (Attribute.isDynamic(item.raw)) { return item.raw }
    if (isRecord(item.raw)) {
      const edited = {...item.raw, ...item.edits}
      return isEqual(edited, item.raw) ? item.raw : edited
    }
    return {...item.marker, location: item.location}
  }

}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}
