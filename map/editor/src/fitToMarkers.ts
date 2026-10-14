import { GeoPoint, MapMarker, MapViewport } from '@randall-plugins/map'
import { WidgetAction, WidgetEditState } from '@randall/plugin-sdk-editor'
import { mapMarkers } from './mapMarkers'
import { centerOn, isViewLocked, roundPoint, roundZoom } from './mapView'

// Fits the view around all pins. A single pin is just centered on, as fitting a point would zoom in all the way.
export const fitToMarkers: WidgetAction = {
  label:   'actions.fit_to_markers',
  icon:    'arrows-to-dot',
  enabled: state => !isViewLocked(state) && pinned(state).length > 0,
  apply:   state => {
    const markers = pinned(state)
    if (markers.length === 0) { return {} }
    if (markers.length === 1) { return {changes: centerOn(state, markers[0].location)} }

    const lats = markers.map(it => it.location.lat)
    const lngs = markers.map(it => it.location.lng)
    const bounds = {west: Math.min(...lngs), south: Math.min(...lats), east: Math.max(...lngs), north: Math.max(...lats)}

    // Pins stick out above their location, so the padding leaves room for the largest one.
    const padding = Math.max(...markers.map(it => it.size)) + FIT_MARGIN
    const viewport = MapViewport.fitBounds(bounds, state.size, padding)

    return {
      changes: [
        {path: 'center', value: roundPoint(viewport.center)},
        {path: 'zoom', value: roundZoom(viewport.zoom)},
        {path: 'bounds', value: null},
      ],
    }
  },
}

function pinned(state: WidgetEditState) {
  return mapMarkers(state).filter((it): it is MapMarker & {location: GeoPoint} => it != null && GeoPoint.is(it.location))
}

const FIT_MARGIN = 16
