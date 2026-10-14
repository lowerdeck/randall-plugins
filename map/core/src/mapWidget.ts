import { defineWidget } from '@randall/plugin-sdk'
import { drawMap } from './drawMap'
import { mapForm } from './params'
import { MapResources, prepareMap } from './prepareMap'
import { mapSettings } from './settings'

export const mapWidget = defineWidget<typeof mapForm, MapResources>({
  name:     'map',
  label:    'label',
  form:     mapForm,
  settings: mapSettings,
  prepare:  prepareMap,
  draw:     drawMap,
})
