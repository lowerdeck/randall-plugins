import { defineWidget } from '@randall/plugin-sdk'
import { mapAssistant } from './assistant'
import { drawMap } from './drawMap'
import { flightAnimations } from './flight'
import { mapForm } from './params'
import { MapResources, prepareMap } from './prepareMap'
import { mapSettings } from './settings'

export const mapWidget = defineWidget<typeof mapForm, MapResources>({
  name:       'map',
  label:      'label',
  form:       mapForm,
  settings:   mapSettings,
  assistant:  mapAssistant,
  prepare:    prepareMap,
  animations: flightAnimations,
  draw:       drawMap,
})
