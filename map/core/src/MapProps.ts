import { resolveParams, WidgetProps } from '@randall/plugin-sdk'
import { MapViewport, MAX_ZOOM } from './geo'
import { Locate } from './locations'
import { mapParams } from './params'

export type MapProps = WidgetProps<typeof mapParams>

export namespace MapProps {

  export function resolve(props: Record<string, unknown>): MapProps {
    return resolveParams(mapParams, props)
  }

  /** All locations that the map shows, to locate them in one go. */
  export function locations(props: MapProps): string[] {
    return [props.center, ...props.markers.map(it => it.location)]
  }

  // Centered on the center, or else on the first marker.
  export function viewport(props: MapProps, locate: Locate): MapViewport {
    const center = locations(props).map(locate).find(it => it != null) ?? {lat: 0, lng: 0}
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, props.zoom)))
  }

}
