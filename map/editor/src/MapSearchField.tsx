import { Autocomplete, CircularProgress } from '@mui/joy'
import { SyntheticEvent, useCallback } from 'react'
import { observer } from 'mobx-react'
import { useWidgetUI } from '@randall/widget-sdk-editor'
import { strings } from './strings'
import { sx$ } from './sx'
import { GeocodeResult } from './GeocodeResult'
import { MapSearchModel } from './MapSearchModel'

export interface MapSearchFieldProps {
  search:   MapSearchModel
  onSelect: (result: GeocodeResult) => void

  disabled?: boolean
}

export const MapSearchField = observer(function MapSearchField(props: MapSearchFieldProps) {

  const {search, onSelect, disabled} = props
  const {Icon} = useWidgetUI()

  const handleInputChange = useCallback((_: SyntheticEvent, value: string, reason: string) => {
    // Selecting an option resets the input to its label, which shouldn't trigger another search.
    if (reason !== 'input' && reason !== 'clear') { return }
    search.setQuery(value)
  }, [search])

  const handleChange = useCallback((_: SyntheticEvent, value: GeocodeResult | string | null) => {
    if (value == null || typeof value === 'string') { return }
    onSelect(value)
  }, [onSelect])

  // #region Rendering

  function render() {
    return (
      <Autocomplete<GeocodeResult, false, false, true>
        sx={$.MapSearchField}
        freeSolo
        disabled={disabled}
        placeholder={strings.searchPlaceholder}
        startDecorator={<Icon icon='magnifying-glass'/>}
        endDecorator={search.searching ? <CircularProgress size='sm'/> : null}
        options={search.results}
        inputValue={search.query}
        onInputChange={handleInputChange}
        onChange={handleChange}
        getOptionLabel={optionLabel}
        getOptionKey={optionKey}
        filterOptions={noFilter}
      />
    )
  }

  // #endregion

  return render()

})

function optionLabel(option: GeocodeResult | string) {
  return typeof option === 'string' ? option : option.label
}

function optionKey(option: GeocodeResult | string) {
  if (typeof option === 'string') { return option }
  return `${option.label}@${option.center.lat},${option.center.lng}`
}

// Results come filtered from the geocoder already.
function noFilter(options: GeocodeResult[]) {
  return options
}

const $ = sx$({
  MapSearchField: {
    flex: '0 0 auto',
  },
})
