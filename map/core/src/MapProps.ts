import { GeoBounds, GeoPoint, Size, WidgetDefinition } from 'templates'
import { MAX_ZOOM, MapViewport } from './geo'
import { mapDefinition } from './definition'
import { MapMarker } from './MapMarker'

export interface MapProps {
  center:         GeoPoint | null
  zoom:           number
  bounds:         GeoBounds | null
  bounds_padding: number

  map_style: string
  markers:   MapMarker[]
}

export namespace MapProps {

  export function resolve(props: Record<string, unknown>): MapProps {
    const resolved = WidgetDefinition.resolveProps<MapProps>(mapDefinition, props)
    const markers = Array.isArray(resolved.markers) ? resolved.markers : []
    return {
      ...resolved,
      markers: markers.filter(it => it != null).map(MapMarker.resolve),
    }
  }

  // Bounds take precedence. Otherwise, the map is centered on the center, or else on the first marker.
  export function viewport(props: MapProps, size: Size): MapViewport {
    if (props.bounds != null && GeoBounds.is(props.bounds)) {
      return MapViewport.fitBounds(props.bounds, size, props.bounds_padding)
    }

    const center = [props.center, ...props.markers.map(it => it.location)].find(GeoPoint.is) ?? {lat: 0, lng: 0}
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, props.zoom)))
  }

}
