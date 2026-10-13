# Randall plugins

Plugins for Randall templates, like maps. A plugin provides a widget: a set of params plus code that draws it onto a
canvas for a given frame. They're built on the plugin SDKs in `sdk/`, and never on the Randall apps themselves:

- `sdk/core`: the widget contract, used everywhere (`defineWidget`).
- `sdk/editor`: what custom editors in the template editor can use (React).
- `sdk/server`: what plugins can do in the backend (settings, resources, queries).

Each plugin has the same three parts, e.g. `map/core`, `map/editor` and `map/server`. The core default-exports its
widget, and the editor (if any) its editor component.

The apps have this repo as a submodule at `plugins`, with `plugins/*/*` in their workspaces. The backend lists the
plugins it offers in a single registry file, and tells the frontend about them. The frontend bundles every plugin from
source, and loads the ones it needs lazily, along with the SDKs.

Tests run with the vitest of an app, e.g. from `frontend/plugins`: `../node_modules/.bin/vitest run`.
