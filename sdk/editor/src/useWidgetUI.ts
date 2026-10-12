import { createContext, useContext } from 'react'
import { WidgetUI } from './WidgetUI'

export function useWidgetUI(): WidgetUI {
  const ui = useContext(WidgetUIContext)
  if (ui == null) {
    throw new Error("useWidgetUI() must be used within a WidgetUIContext provider")
  }
  return ui
}

export const WidgetUIContext = createContext<WidgetUI | null>(null)
