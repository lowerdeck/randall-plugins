import { WidgetEditorProps } from '@randall/widget-sdk-editor'
import 'maplibre-gl/dist/maplibre-gl.css'
import { comparer, reaction } from 'mobx'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useMemo } from 'react'
import { GeocodeResult } from './GeocodeResult'
import { HStack, VStack } from './layout'
import { MapEditorModel } from './MapEditorModel'
import { MapEditorPanel } from './MapEditorPanel'
import { MapSearchField } from './MapSearchField'
import { MapSearchModel } from './MapSearchModel'
import { MapView } from './MapView'
import { sx$ } from './sx'

// Edits the view, style and markers of a map on an interactive map, with a panel on the side.
export const MapEditor = observer(function MapEditor(props: WidgetEditorProps) {

  const {rawProps, props: evaluatedProps, size, onChange, host} = props

  const model = useMemo(
    () => new MapEditorModel(rawProps, evaluatedProps, size, host),
    // The size is followed below, rather than starting over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawProps, evaluatedProps, host],
  )
  useEffect(() => {
    model.setWidgetSize(size)
  }, [model, size])

  useEffect(() => reaction(
    () => model.updates,
    updates => onChange(updates),
    {fireImmediately: true, equals: comparer.structural},
  ), [model, onChange])

  const search = useMemo(() => new MapSearchModel(host), [host])
  useEffect(() => () => search.dispose(), [search])

  const showSearchResult = useCallback((result: GeocodeResult) => {
    model.showSearchResult(result)
  }, [model])

  // #region Rendering

  function render() {
    return (
      <HStack sx={$.MapEditor} alignItems='stretch'>
        <VStack sx={$.map}>
          <MapSearchField
            search={search}
            onSelect={showSearchResult}
            disabled={model.markersLocked && model.viewLocked}
          />
          <MapView model={model}/>
        </VStack>
        <MapEditorPanel model={model}/>
      </HStack>
    )
  }

  // #endregion

  return render()

})

const $ = sx$({
  MapEditor: {
    flex:      '1 1 0',
    minHeight: 0,
    gap:       2,
  },

  map: {
    flex:     '1 1 0',
    minWidth: 0,
    gap:      1,
  },
})
