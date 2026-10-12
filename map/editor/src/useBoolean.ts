import { useCallback, useState } from 'react'

export function useBoolean(initial: boolean = false): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initial)
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  const toggle = useCallback(() => setValue(it => !it), [])
  return [value, setTrue, setFalse, toggle]
}
