/**
 * What a widget tells the template editor's assistant. The assistant only offers widgets that have it, and gets the
 * JSON schemas of their params along with it.
 */
export interface WidgetAssistant {
  /** What the widget is for, and what the schemas of its params don't say, like how they work together. In English. */
  description: string
}
