import { defineWidgetEditor } from '@randall/plugin-sdk-editor'
import { MapContent } from './MapContent'
import { mapSearch } from './mapSearch'
import { markersEditor } from './markersEditor'

export const mapEditor = defineWidgetEditor({
  search:       mapSearch,
  content:      {mount: (container, context, state) => new MapContent(container, context, state)},
  paramEditors: {markers: markersEditor},
})
