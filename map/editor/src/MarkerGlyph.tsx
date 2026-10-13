import { memo } from 'react'
import { Box } from '@mui/joy'
import { isShapeName, shapes, shapeViewBox } from '@randall-plugins/map'
import { sx$ } from './sx'

export interface MarkerGlyphProps {
  icon: string
}

export const MarkerGlyph = memo(function MarkerGlyph(props: MarkerGlyphProps) {

  const {icon} = props
  function render() {
    if (!isShapeName(icon)) { return null }

    return (
      <Box component='svg' sx={$.MarkerGlyph} viewBox={`0 0 ${shapeViewBox} ${shapeViewBox}`}>
        <path d={shapes[icon]}/>
      </Box>
    )
  }

  return render()

})

const $ = sx$({
  MarkerGlyph: {
    width:  '1em',
    height: '1em',
    fill:   'currentColor',
  },
})
