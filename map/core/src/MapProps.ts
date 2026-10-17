import { resolveParams, WidgetProps } from '@randall/plugin-sdk'
import { MapViewport, MAX_ZOOM } from './geo'
import { GeoPoint } from './geo/GeoPoint'
import { Locate } from './locations'
import { mapParams } from './params'

export type MapProps = WidgetProps<typeof mapParams>

export namespace MapProps {

  export function resolve(props: Record<string, unknown>): MapProps {
    return resolveParams(mapParams, props)
  }

  /** All locations that the map shows, to locate them in one go. */
  export function locations(props: MapProps): string[] {
    return [props.center, props.fly_to, ...props.markers.map(it => it.location)]
  }

  // Centered on the center, or else on the first marker.
  export function viewport(props: MapProps, locate: Locate): MapViewport {
    const centerCandidate = [props.center, ...props.markers.map(it => it.location)].map(locate).find(it => it != null)
    const center = centerCandidate ?? defaultCenter()
    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, props.zoom)))
  }

  export function flies(props: MapProps): boolean {
    return props.fly_to.trim() !== ''
  }

  /** Where the map flies to, if anywhere. */
  export function flightTarget(props: MapProps, locate: Locate): MapViewport | null {
    if (!flies(props)) { return null }

    const center = locate(props.fly_to)
    if (center == null) { return null }

    return new MapViewport(center, Math.max(0, Math.min(MAX_ZOOM, props.fly_zoom)))
  }

  export function defaultCenter(): GeoPoint {
    return {
      lat: 52.17, 
      lng: 5.30,
    }
  }

}
