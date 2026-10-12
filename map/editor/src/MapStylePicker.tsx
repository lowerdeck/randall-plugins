import { Option, Select } from '@mui/joy'
import { SyntheticEvent, useCallback } from 'react'
import { mapStyles } from '@randall-widgets/map'
import { observer } from 'mobx-react'
import { useWidgetUI } from '@randall/widget-sdk-editor'
import { sx$ } from './sx'
import { MapEditorModel } from './MapEditorModel'

export interface MapStylePickerProps {
  model: MapEditorModel
}

export const MapStylePicker = observer(function MapStylePicker(props: MapStylePickerProps) {

  const {model} = props
  const {Icon} = useWidgetUI()

  const handleChange = useCallback((_: SyntheticEvent | null, value: string | null) => {
    if (value == null) { return }
    model.setStyle(value)
  }, [model])

  // #region Rendering

  function render() {
    return (
      <Select
        sx={$.MapStylePicker}
        value={model.style}
        onChange={handleChange}
        disabled={model.styleLocked}
        startDecorator={<Icon icon='layer-group'/>}
        indicator={<Icon icon='angles-up-down' size='xs'/>}
      >
        {mapStyles.map(renderOption)}
      </Select>
    )
  }

  function renderOption(style: typeof mapStyles[number]) {
    return (
      <Option key={style.id} value={style.id} children={style.label}/>
    )
  }

  // #endregion

  return render()

})

const $ = sx$({
  MapStylePicker: {
    flex: '0 0 auto',
  },
})
