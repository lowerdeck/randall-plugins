import { defineWidget } from '@randall/plugin-sdk'
import { drawMap } from './drawMap'
import { mapParams } from './params'
import { MapResources, prepareMap } from './prepareMap'
import { mapSettings } from './settings'

export const mapWidget = defineWidget<typeof mapParams, MapResources>({
  name:     'map',
  label:    'Map',
  params:   mapParams,
  settings: mapSettings,
  prepare:  prepareMap,
  draw:     drawMap,
})
