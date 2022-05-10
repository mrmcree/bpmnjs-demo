import CustomPalette from './CustomPalette'
import CustomRenderer from './CustomRenderer'
import CustomContextPad from './CustomContextPad'
export default {
  __init__: ['paletteProvider', 'customRenderer', 'customContextPad'],
  paletteProvider: ['type', CustomPalette],
  customRenderer: ['type', CustomRenderer],
  customContextPad: ['type', CustomContextPad]
}
