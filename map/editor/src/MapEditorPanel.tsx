import { Divider } from '@mui/joy'
import { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useWidgetUI } from '@randall/widget-sdk-editor'
import { VStack } from './layout'
import { strings } from './strings'
import { sx$ } from './sx'
import { MapEditorModel } from './MapEditorModel'
import { MapMarkerItem } from './MapMarkerItem'
import { MapStylePicker } from './MapStylePicker'
import { SelectedMarkerFields } from './SelectedMarkerFields'

export interface MapEditorPanelProps {
  model: MapEditorModel
}

// The side panel of the map dialog, with the style and the markers.
export const MapEditorPanel = observer(function MapEditorPanel(props: MapEditorPanelProps) {

  const {model} = props
  const {Button, Label} = useWidgetUI()

  const centerOnMarker = useCallback(() => {
    model.centerOnSelectedMarker()
  }, [model])

  const addMarker = useCallback(() => {
    model.addMarker()
  }, [model])

  const removeMarker = useCallback(() => {
    model.removeSelectedMarker()
  }, [model])

  // #region Rendering

  function render() {
    return (
      <VStack sx={$.MapEditorPanel}>
        <VStack sx={$.section}>
          <Label level='title-sm'>{strings.style}</Label>
          <MapStylePicker model={model}/>
        </VStack>
        <Divider/>
        {renderMarkers()}
        {renderNotes()}
      </VStack>
    )
  }

  function renderMarkers() {
    return (
      <VStack sx={$.section}>
        <Label level='title-sm'>{strings.markers}</Label>
        <Button
          variant='outlined'
          icon='plus'
          onClick={addMarker}
          disabled={model.markersLocked}
          children={strings.addMarker}
        />
        <Button
          variant='outlined'
          icon='trash'
          onClick={removeMarker}
          disabled={model.markersLocked || model.selectedMarker == null}
          children={strings.removeMarker}
        />
        <Button
          variant='outlined'
          icon='bullseye-pointer'
          onClick={centerOnMarker}
          disabled={model.viewLocked || model.selectedMarker?.location == null}
          children={strings.centerOnMarker}
        />
        <SelectedMarkerFields model={model}/>
      </VStack>
    )
  }

  function renderNotes() {
    const selected = model.selectedMarker
    const notes = [
      model.viewLocked && strings.viewLocked,
      model.markersLocked && strings.markersLocked,
      !model.markersLocked && selected != null && MapMarkerItem.isLocked(selected, 'location') && strings.locationLocked,
      !model.markersLocked && selected != null && lookLocked(selected) && strings.markerLocked,
      model.styleLocked && strings.styleLocked,
    ].filter(Boolean)
    if (notes.length === 0) { return null }

    return (
      <VStack sx={$.notes}>
        {notes.map(renderNote)}
      </VStack>
    )
  }

  function renderNote(note: string | false | undefined, index: number) {
    return (
      <Label key={index} level='body-sm' color='neutral' noWrap={false}>
        {note}
      </Label>
    )
  }

  // #endregion

  return render()

})

function lookLocked(item: MapMarkerItem) {
  return (['icon', 'color', 'size'] as const).some(it => MapMarkerItem.isLocked(item, it))
}

const $ = sx$({
  MapEditorPanel: {
    flex:      '0 0 auto',
    width:     280,
    minHeight: 0,
    overflowY: 'auto',
    gap:       2,
  },

  section: {
    gap: 1,
  },

  notes: {
    mt:  'auto',
    gap: 1,
  },
})
