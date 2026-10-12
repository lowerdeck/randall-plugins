import { defineWidget } from '@randall/widget-sdk'
import { mapDefinition } from './definition'
import { drawMap } from './drawMap'
import { MapProps } from './MapProps'
import { MapResources, prepareMap } from './prepareMap'
import { mapSettings } from './settings'

export const mapWidget = defineWidget<MapProps, MapResources>({
  definition:   mapDefinition,
  settings:     mapSettings,
  paramHints:   {
    center:         'dialog',
    zoom:           'dialog',
    bounds:         'dialog',
    bounds_padding: 'dialog',
    map_style:      'dialog',
  },
  resolveProps: MapProps.resolve,
  prepare:      prepareMap,
  draw:         drawMap,
})
