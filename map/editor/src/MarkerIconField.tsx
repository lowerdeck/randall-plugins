import { useRef } from 'react'
import { observer } from 'mobx-react'
import { useWidgetUI } from '@randall/plugin-sdk-editor'
import { useBoolean } from './useBoolean'
import { strings } from './strings'
import { sx$ } from './sx'
import { MarkerGlyph } from './MarkerGlyph'
import { MarkerIconGrid } from './MarkerIconGrid'

export interface MarkerIconFieldProps {
  value:    string | null
  onChange: (value: string | null) => void

  disabled?: boolean
}

// A small button showing the current icon, which opens a grid to pick another.
export const MarkerIconField = observer(function MarkerIconField(props: MarkerIconFieldProps) {

  const {value, onChange, disabled} = props

  const buttonRef = useRef<HTMLButtonElement>(null)
  const {Button, Popup} = useWidgetUI()
  const [open, , close, toggle] = useBoolean()

  // #region Rendering

  function render() {
    return (
      <>
        <Button
          ref={buttonRef}
          sx={$.button}
          variant='outlined'
          color='neutral'
          size='sm'
          onClick={toggle}
          disabled={disabled}
          children={value == null ? strings.noIcon : <MarkerGlyph icon={value}/>}
        />
        <Popup
          open={open}
          anchor={buttonRef.current}
          placement='bottom-start'
          requestClose={close}
          children={<MarkerIconGrid value={value} onChange={onChange} onPicked={close}/>}
        />
      </>
    )
  }

  // #endregion

  return render()

})

const $ = sx$({
  button: {
    flex:     '0 0 auto',
    minWidth: 40,
    px:       1,
  },
})
