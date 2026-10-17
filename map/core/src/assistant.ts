import { WidgetAssistant } from '@randall/plugin-sdk'

export const mapAssistant: WidgetAssistant = {
  description: `
A map of MapTiler raster tiles, with markers on it. Give it a width and a height.

The map is centered on \`center\`, or else on the location of the first marker, at \`zoom\` (0 is the whole world, around 12 a city, 16 or more a street).

Locations (\`center\`, and the \`location\` of markers) are texts: "lat, lng", or an address or place name, which the map looks up. To show a location that varies per rendering, bind it to a text param, like \`{"$": "address"}\`. The \`markers\` list can't be bound as a whole: to put a pin on an address param, add a marker and bind its \`location\`. An empty \`center\` centers the map on the first marker.

\`map_style\` is one of the MapTiler styles; \`labels\` only applies to \`satellite\`, whose tiles are otherwise without labels. \`map_opacity\` is a percentage. Keep \`attribution\` on, unless the template credits MapTiler and OpenStreetMap elsewhere.

To animate the map, set \`fly_to\` to a second location: the map flies from its view to \`fly_to\` at \`fly_zoom\`, zooming out and back in on the way. It flies over the frames of its \`flight\` animation, which the template's animations set in a widget track, or else over the first 3 seconds. Add markers on both locations to show where it flies from and to.

A marker is a pin of \`size\` pixels, in \`color\`, with an optional \`icon\` drawn inside it.
`.trim(),
}
