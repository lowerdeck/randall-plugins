import { Theme } from '@mui/joy/styles'
import { SystemStyleObject } from '@mui/system'

// Types style objects, so that theme callbacks get their argument typed.
export function sx$<K extends string>(styles: Record<K, SystemStyleObject<Theme>>): Record<K, SystemStyleObject<Theme>> {
  return styles
}
