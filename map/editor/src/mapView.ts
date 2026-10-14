import { formatLocation, GeoPoint, locateCached, MapProps, MapViewport, MAX_ZOOM } from '@randall-plugins/map'
import { WidgetChange, WidgetEditState } from '@randall/plugin-sdk-editor'

/** The view as it will be rendered, in widget zoom units, with the locations that have been looked up so far. */
export function mapView(state: WidgetEditState): MapViewport {
  return MapProps.viewport(MapProps.resolve(state.values), locateCached)
}

/** Centers the view on a point, keeping its zoom. */
export function centerOn(state: WidgetEditState, point: GeoPoint): WidgetChange[] {
  return [
    {path: 'center', value: formatLocation(point)},
    {path: 'zoom', value: roundZoom(mapView(state).zoom)},
  ]
}

export function isCenterLocked(state: WidgetEditState) {
  return state.isLocked('center')
}

export function isZoomLocked(state: WidgetEditState) {
  return state.isLocked('zoom')
}

/** Whether the view can't be changed freely, as it can't be both moved and zoomed. */
export function isViewLocked(state: WidgetEditState) {
  return isCenterLocked(state) || isZoomLocked(state)
}

export function sameView(a: MapViewport, b: MapViewport) {
  return (
    Math.abs(a.center.lat - b.center.lat) < VIEW_TOLERANCE &&
    Math.abs(a.center.lng - b.center.lng) < VIEW_TOLERANCE &&
    Math.abs(a.zoom - b.zoom) < ZOOM_TOLERANCE
  )
}

// About 10 cm, more than enough.
export function roundPoint(point: GeoPoint): GeoPoint {
  return {
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6,
  }
}

export function roundZoom(zoom: number) {
  return Math.round(Math.max(0, Math.min(MAX_ZOOM, zoom)) * 100) / 100
}

// Just over the rounding above, so that rounded values count as the same view.
const VIEW_TOLERANCE = 2e-6
const ZOOM_TOLERANCE = 0.006
