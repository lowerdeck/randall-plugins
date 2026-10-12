import { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { autorun } from 'mobx'
import { useEffect } from 'react'
import { createPinElement } from './createPinElement'
import { MapEditorModel } from './MapEditorModel'

// Shows the markers as draggable pins. They're rebuilt on any change, which is fine as drags only report at their end.
export function usePinMarkers(map: MapLibreMap | null, model: MapEditorModel, width: number) {
  useEffect(() => {
    if (map == null) { return }

    let pins: Marker[] = []
    const removePins = () => {
      pins.forEach(it => it.remove())
      pins = []
    }

    const dispose = autorun(() => {
      removePins()

      model.markers.forEach((item, index) => {
        if (item.location == null) { return }

        const element = createPinElement({
          color:    item.marker.color,
          height:   model.pinHeight(item, width),
          icon:     item.marker.icon,
          selected: index === model.selectedIndex,
        })
        element.addEventListener('click', () => model.selectMarker(index))

        const pin = new Marker({element, anchor: 'bottom', draggable: !model.isMarkerFieldLocked(index, 'location')})
        pin.on('dragstart', () => model.selectMarker(index))
        pin.on('dragend', () => {
          const {lat, lng} = pin.getLngLat().wrap()
          model.setMarkerLocation(index, {lat, lng})
        })
        pin.setLngLat([item.location.lng, item.location.lat]).addTo(map)
        pins.push(pin)
      })
    })

    return () => {
      dispose()
      removePins()
    }
  }, [map, model, width])
}
