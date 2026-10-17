import { TileCoord } from './geo'

export function tileKey(tile: TileCoord): string {
  return `${tile.z}/${tile.x}/${tile.y}`
}
