import { formatLocation, GeoPoint, locateCached, MapMarker, MapViewport } from '@randall-plugins/map'
import { WidgetAction, WidgetEditState } from '@randall/plugin-sdk-editor'
import { mapMarkers } from './mapMarkers'
import { centerOn, isViewLocked, roundZoom } from './mapView'

// Fits the view around all pins. A single pin is just centered on, as fitting a point would zoom in all the way.
export const fitToMarkers: WidgetAction = {
  label:   'actions.fit_to_markers',
  icon:    'arrows-to-dot',
  enabled: state => !isViewLocked(state) && pinned(state).length > 0,
  apply:   state => {
    const markers = pinned(state)
    if (markers.length === 0) { return {} }
    if (markers.length === 1) { return {changes: centerOn(state, markers[0].point)} }

    const lats = markers.map(it => it.point.lat)
    const lngs = markers.map(it => it.point.lng)
    const bounds = {west: Math.min(...lngs), south: Math.min(...lats), east: Math.max(...lngs), north: Math.max(...lats)}

    // Pins stick out above their location, so the padding leaves room for the largest one.
    const padding = Math.max(...markers.map(it => it.size)) + FIT_MARGIN
    const viewport = MapViewport.fitBounds(bounds, state.size, padding)

    return {
      changes: [
        {path: 'center', value: formatLocation(viewport.center)},
        {path: 'zoom', value: roundZoom(viewport.zoom)},
      ],
    }
  },
}

// The markers that have been located.
function pinned(state: WidgetEditState): Array<MapMarker & {point: GeoPoint}> {
  return mapMarkers(state).flatMap(marker => {
    const point = marker == null ? null : locateCached(marker.location)
    return marker == null || point == null ? [] : [{...marker, point}]
  })
}

const FIT_MARGIN = 16
