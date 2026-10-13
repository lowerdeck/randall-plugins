import { resolveParams, WidgetProps, WidgetSize } from '@randall/plugin-sdk'
import { GeoBounds, GeoPoint, MAX_ZOOM, MapViewport } from './geo'
import { mapParams } from './params'

export type MapProps = WidgetProps<typeof mapParams>

export namespace MapProps {

  export function resolve(props: Record<string, unknown>): MapProps {
    return resolveParams(mapParams, props)
  }

  // Bounds take precedence. Otherwise, the map is centered on the center, or else on the first marker.
  export function viewport(props: MapProps, size: WidgetSize): MapViewport {
    if (props.bounds != null && GeoBounds.is(props.bounds)) {
      return MapViewport.fitBounds(props.bounds, size, props.bounds_padding)
    }

    const center = [props.center, ...props.markers.map(it => it.location)].find(GeoPoint.is) ?? {lat: 0, lng: 0}
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, props.zoom)))
  }

}
