import { form, formParams, param } from '@randall/plugin-sdk'
import { MapMarker, markerParams } from './MapMarker'
import { hasLabelToggle, mapStyles } from './styles'

export const mapForm = [
  form.fieldset('view', [
    // Like the locations of markers. Without one, the map is centered on the first marker.
    param.text('center', {default: '', edit: 'dialog'}),

    param.number('zoom', {
      min:     0,
      max:     22,
      default: 12,
      edit:    'dialog',
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
    default:   [MapMarker.create('52.3731, 4.8926')],
    edit:      'dialog',
  }),
]

export const mapParams = formParams(mapForm)
