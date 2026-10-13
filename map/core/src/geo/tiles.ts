import { WidgetRect, WidgetSize } from '@randall/plugin-sdk'
import { MapViewport } from './MapViewport'
import { project, TILE_SIZE } from './mercator'

// Lists the raster tiles needed to cover a map of the given size, with their rects relative to the map's top-left.
export function visibleTiles(viewport: MapViewport, size: WidgetSize, maxTileZoom: number = MAX_TILE_ZOOM): PlacedTile[] {
  const z = tileZoom(viewport.zoom, maxTileZoom)
  const count = 2 ** z
  const tileSize = TILE_SIZE * 2 ** (viewport.zoom - z)

  const [cx, cy] = project(viewport.center).map(it => it * count)
  const left = cx - size.width / 2 / tileSize
  const top = cy - size.height / 2 / tileSize
  const right = cx + size.width / 2 / tileSize
  const bottom = cy + size.height / 2 / tileSize

  const tiles: PlacedTile[] = []
  for (let ty = Math.max(0, Math.floor(top)); ty <= Math.min(count - 1, Math.ceil(bottom) - 1); ty++) {
    for (let tx = Math.floor(left); tx <= Math.ceil(right) - 1; tx++) {
      tiles.push({
        tile: {z, x: ((tx % count) + count) % count, y: ty},
        rect: {
          left:   size.width / 2 + (tx - cx) * tileSize,
          top:    size.height / 2 + (ty - cy) * tileSize,
          width:  tileSize,
          height: tileSize,
        },
      })
    }
  }
  return tiles
}

// Rounds to the nearest tile zoom, such that tiles are drawn between 0.71x and 1.41x their native size.
export function tileZoom(zoom: number, maxTileZoom: number = MAX_TILE_ZOOM): number {
  return Math.max(0, Math.min(maxTileZoom, Math.round(zoom)))
}

export function tileURL(template: string, tile: TileCoord): string {
  return template
    .replace('{z}', `${tile.z}`)
    .replace('{x}', `${tile.x}`)
    .replace('{y}', `${tile.y}`)
}

export interface TileCoord {
  z: number
  x: number
  y: number
}

export interface PlacedTile {
  tile: TileCoord
  rect: WidgetRect
}

export const MAX_TILE_ZOOM = 20
