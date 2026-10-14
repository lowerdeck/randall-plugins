import { WidgetRect } from '@randall/plugin-sdk'
import { WidgetPrepareContext } from '@randall/plugin-sdk'
import { GeoPoint, MapViewport, visibleTiles } from './geo'
import { locateAll } from './locations'
import { MapProps } from './MapProps'
import { tileStyle } from './styles'
import { tilePath } from './tilePath'

// Locations and tiles that fail to load are reported and left out, so that a preview still shows the rest of the map.
export async function prepareMap(props: MapProps, {size, host}: WidgetPrepareContext): Promise<MapResources> {
  const locate = await locateAll(MapProps.locations(props), host, host.reportError)
  const viewport = MapProps.viewport(props, locate)
  const markers = props.markers.map(it => locate(it.location))
  const placed = visibleTiles(viewport, size)

  const style = tileStyle(props.map_style, props.labels)
  const results = await Promise.allSettled(placed.map(it => host.loadImage(tilePath(style, it.tile))))

  const tiles: LoadedTile[] = []
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      tiles.push({rect: placed[index].rect, image: result.value})
    } else {
      host.reportError(result.reason)
    }
  })

  return {viewport, markers, tiles}
}

export interface MapResources {
  viewport: MapViewport

  /** The locations of the markers, by index. */
  markers: Array<GeoPoint | null>

  tiles:    LoadedTile[]
}

export interface LoadedTile {
  rect:  WidgetRect
  image: CanvasImageSource
}
