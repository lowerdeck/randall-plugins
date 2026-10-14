import { form, formParams, param } from '@randall/plugin-sdk'
import { MapMarker, markerParams } from './MapMarker'
import { GeoBounds, GeoPoint } from './geo'
import { hasLabelToggle, mapStyles } from './styles'

export const mapForm = [
  form.hidden([
    param.custom('center', {
      schema:  GeoPoint.paramSchema.nullable(), 
      default: null,
    }),

    param.number('zoom', {
      min:     0, 
      max:     22, 
      default: 12,
    }),

    param.custom('bounds', {
      schema:  GeoBounds.schema.nullable(), 
      default: null,
    }),
  ]),

  form.fieldset('map', [

    param.choice('map_style', {
      choices: mapStyles.map(it => ({value: it.id, label: `map_styles.${it.id}`})),
      default: mapStyles[0].id,
      edit:    'dialog',
    }),

    param.boolean('labels', {default: true, edit: 'dialog', visible: values => hasLabelToggle(`${values.map_style}`)}),
    param.boolean('grayscale', {default: false, edit: 'dialog'}),
    param.number('map_opacity', {int: true, min: 0, max: 100, default: 100, edit: 'dialog'}),

    // MapTiler and OpenStreetMap require it, unless shown elsewhere.
    param.boolean('attribution', {default: true, edit: 'dialog'}),
  ]),

  form.repeaterFieldset('markers', {
    itemLabel: 'params.markers.item',
    item:      param.object('marker', {params: markerParams}),
    default:   [MapMarker.create({lat: 52.3731, lng: 4.8926})],
    edit:      'dialog',
  }),
]

export const mapParams = formParams(mapForm)
