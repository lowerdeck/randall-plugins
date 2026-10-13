import { WidgetRect } from '@randall/plugin-sdk'
import { WidgetPrepareContext } from '@randall/plugin-sdk'
import { MapViewport, visibleTiles } from './geo'
import { MapProps } from './MapProps'
import { tilePath } from './tilePath'

// Tiles that fail to load are reported and left out, so that a preview still shows the rest of the map.
export async function prepareMap(props: MapProps, {size, host}: WidgetPrepareContext): Promise<MapResources> {
  const viewport = MapProps.viewport(props, size)
  const placed = visibleTiles(viewport, size)

  const results = await Promise.allSettled(placed.map(it => host.loadImage(tilePath(props.map_style, it.tile))))

  const tiles: LoadedTile[] = []
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      tiles.push({rect: placed[index].rect, image: result.value})
    } else {
      host.reportError(result.reason)
    }
  })

  return {viewport, tiles}
}

export interface MapResources {
  viewport: MapViewport
  tiles:    LoadedTile[]
}

export interface LoadedTile {
  rect:  WidgetRect
  image: CanvasImageSource
}
