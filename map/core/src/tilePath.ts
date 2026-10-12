import { TileCoord } from './geo'

// Tiles are resources of the map widget, served with the organisation's credentials by its server part.
export function tilePath(style: string, tile: TileCoord | {z: string, x: string, y: string}): string {
  return `tiles/${encodeURIComponent(style)}/${tile.z}/${tile.x}/${tile.y}`
}

export function parseTilePath(path: string): {style: string, tile: TileCoord} | null {
  const match = path.match(/^tiles\/([^/]+)\/(\d+)\/(\d+)\/(\d+)$/)
  if (match == null) { return null }

  const [, style, z, x, y] = match
  return {style: decodeURIComponent(style), tile: {z: Number(z), x: Number(x), y: Number(y)}}
}
