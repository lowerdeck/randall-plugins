import { WidgetAssistant } from '@randall/plugin-sdk'

export const mapAssistant: WidgetAssistant = {
  description: `
A map of MapTiler raster tiles, with markers on it. Give it a width and a height.

What the map shows: \`bounds\` if set, fitted to the size of the map. Otherwise it is centered on \`center\`, or else on the location of the first marker, at \`zoom\` (0 is the whole world, around 12 a city, 16 or more a street).

Locations (\`center\`, and the \`location\` of markers) are \`{lat, lng}\` objects or "lat, lng" strings. Bind them to a \`location\` param of the template, and \`bounds\` to a \`bounds\` param, like \`{"$": "location"}\`; within the markers list too.

\`map_style\` is one of the MapTiler styles; \`labels\` only applies to \`satellite\`, whose tiles are otherwise without labels. \`map_opacity\` is a percentage. Keep \`attribution\` on, unless the template credits MapTiler and OpenStreetMap elsewhere.

A marker is a pin of \`size\` pixels, in \`color\`, with an optional \`icon\` drawn inside it.
`.trim(),
}
