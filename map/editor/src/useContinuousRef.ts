import { useRef } from 'react'

// A ref that always holds the latest value, for use in effects that shouldn't rerun when it changes.
export function useContinuousRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
