import { defineWidgetEditor } from '@randall/plugin-sdk-editor'
import { MapPreview } from './MapPreview'
import { fitToMarkers } from './fitToMarkers'
import { mapSearch } from './mapSearch'
import { markersEditor } from './markersEditor'

export const mapEditor = defineWidgetEditor({
  search:          mapSearch,
  preview:         (...args) => new MapPreview(...args),
  paramEditors:    {markers: markersEditor},
  fieldsetActions: {view: [fitToMarkers]},
})
