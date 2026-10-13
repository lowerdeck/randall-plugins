import { useEffect, useState } from 'react'
import { WidgetSize } from '@randall/plugin-sdk'

// The largest size with the given aspect ratio that fits in the element.
export function useFittedSize(aspect: WidgetSize): [(element: HTMLElement | null) => void, WidgetSize | null] {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [size, setSize] = useState<WidgetSize | null>(null)

  useEffect(() => {
    if (element == null) { return }

    const measure = () => {
      const {clientWidth, clientHeight} = element
      if (clientWidth <= 0 || clientHeight <= 0) { return }

      const scale = Math.min(clientWidth / aspect.width, clientHeight / aspect.height)
      const width = Math.floor(aspect.width * scale)
      const height = Math.floor(aspect.height * scale)
      setSize(prev => prev?.width === width && prev?.height === height ? prev : {width, height})
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()
    return () => { observer.disconnect() }
  }, [element, aspect])

  return [setElement, size]
}
