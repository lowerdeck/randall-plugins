import { param } from '@randall/plugin-sdk'
import { GeoBounds, GeoPoint } from './geo'
import { MapMarker, markerParams } from './MapMarker'
import { mapStyles } from './styles'

export const mapParams = {
  center: param.custom({label: 'Center', schema: GeoPoint.paramSchema.nullable(), default: null}),
  zoom:   param.number({label: 'Zoom', min: 0, max: 22, default: 12, edit: 'content'}),
  bounds: param.custom({label: 'Bounds', schema: GeoBounds.schema.nullable(), default: null}),

  bounds_padding: param.number({label: 'Bounds padding', int: true, min: 0, default: 40, edit: 'dialog'}),

  map_style: param.choice({
    label:   'Style',
    choices: mapStyles.map(it => ({value: it.id, label: it.label})),
    default: mapStyles[0].id,
    edit:    'dialog',
  }),

  markers: param.list({
    label:     'Markers',
    itemLabel: 'Marker',
    item:      markerParams,
    default:   [MapMarker.create({lat: 52.3731, lng: 4.8926})],
    edit:      'dialog',
  }),
}
