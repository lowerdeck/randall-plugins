# Randall widgets

Widgets for Randall templates, like maps. A widget is a set of params plus code that draws it onto a canvas for a
given frame. They're built on the widget SDKs in `sdk/`, and never on the Randall apps themselves:

- `sdk/core`: the widget contract, used everywhere (`defineWidget`).
- `sdk/editor`: what custom editors in the template editor can use (React).
- `sdk/server`: what widgets can do in the backend (settings, resources, queries).

Each widget has the same three parts, e.g. `map/core`, `map/editor` and `map/server`.

The apps have this repo as a submodule at `vendor/widgets`, with `vendor/widgets/*/*` in their workspaces, and list the
widgets they offer in a single registry file.

Tests run with the vitest of an app, e.g. from `frontend/vendor/widgets`: `../../app/node_modules/.bin/vitest run`.
