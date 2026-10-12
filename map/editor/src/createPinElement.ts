import { isShapeName, markerGlyphTransform, markerHole, markerPath, markerViewBox, shapes } from '@randall-widgets/map'

// The map pin as a DOM element, looking like the one drawn by the renderers.
export function createPinElement(options: PinElementOptions): HTMLElement {
  const {color, height, icon, selected} = options
  const [viewWidth, viewHeight] = markerViewBox
  const width = height * viewWidth / viewHeight

  const svg = svgElement('svg', {
    viewBox: `0 0 ${viewWidth} ${viewHeight}`,
    width:   `${width}`,
    height:  `${height}`,
  })
  svg.style.overflow = 'visible'
  svg.style.filter = selected
    ? `drop-shadow(0 0 2px ${selectionColor}) drop-shadow(0 0 2px ${selectionColor})`
    : `drop-shadow(0 ${height * 0.04}px ${height * 0.05}px rgba(0, 0, 0, 0.31))`

  svg.appendChild(svgElement('path', {d: markerPath, fill: color}))
  svg.appendChild(renderHead(icon))

  const element = document.createElement('div')
  element.appendChild(svg)
  element.style.lineHeight = '0'
  element.style.cursor = 'pointer'
  element.style.zIndex = selected ? '1' : '0'
  return element
}

export interface PinElementOptions {
  color:    string
  height:   number
  icon:     string | null
  selected: boolean
}

function renderHead(icon: string | null) {
  if (!isShapeName(icon)) {
    return svgElement('circle', {
      cx:   `${markerHole.cx}`,
      cy:   `${markerHole.cy}`,
      r:    `${markerHole.r}`,
      fill: 'white',
    })
  }

  const {x, y, scale} = markerGlyphTransform()
  return svgElement('path', {
    d:         shapes[icon],
    fill:      'white',
    transform: `translate(${x} ${y}) scale(${scale})`,
  })
}

function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string>): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
  return element
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const selectionColor = '#2196f3'
