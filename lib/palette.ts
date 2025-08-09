import type { Palette } from "./types"

export function paletteGrad(p: Palette) {
  switch (p) {
    case "blue-purple":
      return { range: "from-blue-600 to-purple-600" }
    case "teal-indigo":
      return { range: "from-teal-600 to-indigo-600" }
    case "violet-emerald":
    default:
      return { range: "from-violet-600 to-emerald-600" }
  }
}
