import { buildParam, GeoPoint, WidgetDefinition } from 'templates'
import { MapMarker } from './MapMarker'
import { mapStyles } from './styles'

export const mapDefinition: WidgetDefinition = {
  name:   'map',
  label:  'Map',
  params: [{
    group:  'Map',
    params: [
      buildParam('location', 'center', 'Center'),
      buildParam('number', 'zoom', 'Zoom', {int: false, min: 0, max: 22, default: 12}),
      buildParam('bounds', 'bounds', 'Bounds'),
      buildParam('number', 'bounds_padding', 'Bounds padding', {min: 0, default: 40}),
      buildParam('choice', 'map_style', 'Style', {
        choices: mapStyles.map(it => ({value: it.id, label: it.label})),
        default: mapStyles[0].id,
      }),
    ],
  }],

  // Edited in the map dialog, rather than as params.
  defaults: {
    markers: [MapMarker.create({lat: 52.3731, lng: 4.8926} satisfies GeoPoint)],
  },
}
