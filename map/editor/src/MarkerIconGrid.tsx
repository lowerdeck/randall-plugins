import { Box, IconButton } from '@mui/joy'
import { useCallback } from 'react'
import { memo } from 'react'
import { shapeNames } from '@randall-plugins/map'
import { sx$ } from './sx'
import { MarkerGlyph } from './MarkerGlyph'

export interface MarkerIconGridProps {
  value:    string | null
  onChange: (value: string | null) => void
  onPicked?: () => void
}

// Clicking the selected icon clears it.
export const MarkerIconGrid = memo(function MarkerIconGrid(props: MarkerIconGridProps) {

  const {value, onChange, onPicked} = props

  const pick = useCallback((icon: string) => {
    onChange(icon === value ? null : icon)
    onPicked?.()
  }, [onChange, onPicked, value])

  function render() {
    return (
      <Box sx={$.MarkerIconGrid}>
        {shapeNames.map(icon => (
          <MarkerIconButton key={icon} icon={icon} selected={icon === value} onPick={pick}/>
        ))}
      </Box>
    )
  }

  return render()

})

interface MarkerIconButtonProps {
  icon:     string
  selected: boolean
  onPick:   (icon: string) => void
}

const MarkerIconButton = memo(function MarkerIconButton(props: MarkerIconButtonProps) {

  const {icon, selected, onPick} = props

  const handleClick = useCallback(() => {
    onPick(icon)
  }, [icon, onPick])

  function render() {
    return (
      <IconButton
        size='sm'
        variant={selected ? 'solid' : 'plain'}
        color={selected ? 'primary' : 'neutral'}
        onClick={handleClick}
        title={icon}
        children={<MarkerGlyph icon={icon}/>}
      />
    )
  }

  return render()

})

const $ = sx$({
  MarkerIconGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(5, 32px)',
    gap:                 1/2,
  },
})
