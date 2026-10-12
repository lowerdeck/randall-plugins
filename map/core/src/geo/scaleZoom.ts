// The zoom at which a map `toWidth` pixels wide shows the same extent as one `fromWidth` pixels wide at `zoom`.
export function scaleZoom(zoom: number, fromWidth: number, toWidth: number): number {
  return zoom + Math.log2(toWidth / fromWidth)
}
