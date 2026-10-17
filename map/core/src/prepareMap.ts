import { WidgetPrepareContext } from '@randall/plugin-sdk'
import { flightAnimation, FlightPath, flightPath, flightTiles } from './flight'
import { GeoPoint, MapViewport, visibleTiles } from './geo'
import { loadTiles } from './loadTiles'
import { locateAll } from './locations'
import { MapProps } from './MapProps'
import { tileStyle } from './styles'

// Locations and tiles that fail to load are reported and left out, so that a preview still shows the rest of the map.
export async function prepareMap(props: MapProps, {size, host, animations}: WidgetPrepareContext): Promise<MapResources> {
  const locate = await locateAll(MapProps.locations(props), host, host.reportError)
  const viewport = MapProps.viewport(props, locate)
  const frames = animations[flightAnimation.name]
  const target = frames == null ? null : MapProps.flightTarget(props, locate)
  const flight = target == null ? null : flightPath(viewport, target, size)
  const markers = props.markers.map(it => locate(it.location))

  const needed = flight == null || frames == null
    ? visibleTiles(viewport, size).map(it => it.tile)
    : flightTiles(flight, size, frames)
  const tiles = await loadTiles(tileStyle(props.map_style, props.labels), needed, host)

  return {viewport, flight, markers, tiles}
}

export interface MapResources {
  viewport: MapViewport

  /** The viewports while flying, if the map flies. */
  flight: FlightPath | null

  /** The locations of the markers, by index. */
  markers: Array<GeoPoint | null>

  /** By `tileKey`. */
  tiles: Map<string, CanvasImageSource>
}
