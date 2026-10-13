import { StyleSpecification } from 'maplibre-gl'
import { MAX_TILE_ZOOM, TILE_SIZE, tilePath } from '@randall-plugins/map'
import { WidgetEditorHost } from '@randall/plugin-sdk-editor'

export function rasterStyle(style: string, host: WidgetEditorHost): StyleSpecification {
  return {
    version: 8,
    sources: {
      [TILES_SOURCE]: {
        type:        'raster',
        tiles:       [tileURLTemplate(style, host)],
        tileSize:    TILE_SIZE,
        maxzoom:     MAX_TILE_ZOOM,
        attribution: attribution,
      },
    },
    layers: [{
      id:     'tiles',
      type:   'raster',
      source: TILES_SOURCE,
    }],
  }
}

export function tileURLTemplate(style: string, host: WidgetEditorHost): string {
  return host.resourceURL(tilePath(style, {z: '{z}', x: '{x}', y: '{y}'}))
}

export const TILES_SOURCE = 'tiles'

const attribution = '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
