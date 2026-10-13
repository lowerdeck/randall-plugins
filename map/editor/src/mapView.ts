import { GeoPoint, MapProps, MapViewport, MAX_ZOOM } from '@randall-plugins/map'
import { WidgetChange, WidgetEditState } from '@randall/plugin-sdk-editor'

/** The view as it will be rendered, in widget zoom units. */
export function mapView(state: WidgetEditState): MapViewport {
  return MapProps.viewport(MapProps.resolve(state.values), state.size)
}

/** Centers the view on a point, keeping its zoom. */
export function centerOn(state: WidgetEditState, point: GeoPoint): WidgetChange[] {
  return [
    {path: 'center', value: point},
    {path: 'zoom', value: roundZoom(mapView(state).zoom)},
    {path: 'bounds', value: null},
  ]
}

// Bounds take precedence over center and zoom, so a bound bounds prop can't be overridden either.
export function isViewLocked(state: WidgetEditState) {
  return ['center', 'zoom', 'bounds'].some(it => state.isLocked(it))
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
