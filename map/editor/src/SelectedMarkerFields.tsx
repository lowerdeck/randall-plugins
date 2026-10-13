import { useCallback } from 'react'
import { MapMarker, ShapeName } from '@randall-plugins/map'
import { useWidgetUI } from '@randall/plugin-sdk-editor'
import { HStack, VStack } from './layout'
import { observer } from 'mobx-react'
import { strings } from './strings'
import { sx$ } from './sx'
import { MapEditorModel } from './MapEditorModel'
import { MarkerIconField } from './MarkerIconField'

export interface SelectedMarkerFieldsProps {
  model: MapEditorModel
}

// The look of the selected marker. Fields bound to data show their value, but can't be edited.
export const SelectedMarkerFields = observer(function SelectedMarkerFields(props: SelectedMarkerFieldsProps) {

  const {model} = props

  const changeIcon = useCallback((icon: string | null) => {
    model.updateSelectedMarker('icon', icon as ShapeName | null)
  }, [model])

  const {Label, ColorField, NumberField} = useWidgetUI()

  const changeColor = useCallback((color: string | null) => {
    model.updateSelectedMarker('color', color ?? MapMarker.defaults.color)
  }, [model])

  const changeSize = useCallback((size: number | null) => {
    model.updateSelectedMarker('size', size ?? MapMarker.defaults.size)
  }, [model])

  // #region Rendering

  function render() {
    const index = model.selectedIndex
    const item = model.selectedMarker
    if (index == null || item == null) { return null }

    const locked = (field: keyof MapMarker) => model.isMarkerFieldLocked(index, field)

    return (
      <VStack sx={$.SelectedMarkerFields}>
        <HStack sx={$.row}>
          <Label sx={$.label} level='body-sm'>{strings.markerIcon}</Label>
          <MarkerIconField
            value={item.marker.icon}
            onChange={changeIcon}
            disabled={locked('icon')}
          />
        </HStack>
        <HStack sx={$.row}>
          <Label sx={$.label} level='body-sm'>{strings.markerColor}</Label>
          <ColorField
            sx={$.field}
            value={item.marker.color}
            onChange={locked('color') ? undefined : changeColor}
            size='sm'
          />
        </HStack>
        <HStack sx={$.row}>
          <Label sx={$.label} level='body-sm'>{strings.markerSize}</Label>
          <NumberField
            sx={$.field}
            value={item.marker.size}
            onChange={changeSize}
            min={0}
            disabled={locked('size')}
            size='sm'
          />
        </HStack>
      </VStack>
    )
  }

  // #endregion

  return render()

})

const $ = sx$({
  SelectedMarkerFields: {
    pt:  1,
    gap: 1,
  },

  row: {
    gap: 1,
  },

  label: {
    flex:  '0 0 auto',
    width: 56,
  },

  field: {
    flex: '1 1 0',
  },
})
