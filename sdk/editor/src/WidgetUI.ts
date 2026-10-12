import { ComponentType, ReactNode, Ref } from 'react'

/**
 * Components of the template editor that widget editors can use, so that they look like the rest of it. Anything else
 * can be built with Joy UI, which the template editor is themed with. `sx` is passed on to Joy.
 */
export interface WidgetUI {
  Button:      ComponentType<WidgetButtonProps>
  Icon:        ComponentType<WidgetIconProps>
  Label:       ComponentType<WidgetLabelProps>
  Popup:       ComponentType<WidgetPopupProps>
  ColorField:  ComponentType<WidgetColorFieldProps>
  NumberField: ComponentType<WidgetNumberFieldProps>
}

export interface WidgetButtonProps {
  children?: ReactNode
  icon?:     string
  variant?:  'solid' | 'outlined' | 'plain' | 'soft'
  color?:    'primary' | 'neutral' | 'danger'
  size?:     'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?:  () => void
  sx?:       unknown
  ref?:      Ref<HTMLButtonElement>
}

export interface WidgetIconProps {
  icon:  string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export interface WidgetLabelProps {
  children?: ReactNode
  level?:    'title-sm' | 'body-sm' | 'body-md' | 'body-xs'
  color?:    'neutral' | 'danger'
  noWrap?:   boolean
  sx?:       unknown
}

export interface WidgetPopupProps {
  open:         boolean
  anchor:       HTMLElement | null
  placement?:   'bottom-start' | 'bottom' | 'bottom-end'
  requestClose: () => void
  children?:    ReactNode
}

export interface WidgetColorFieldProps {
  /** A hex color. */
  value:     string | null
  onChange?: (value: string | null) => void
  size?:     'sm' | 'md'
  sx?:       unknown
}

export interface WidgetNumberFieldProps {
  value:     number | null
  onChange?: (value: number | null) => void
  min?:      number
  max?:      number
  disabled?: boolean
  size?:     'sm' | 'md'
  sx?:       unknown
}
