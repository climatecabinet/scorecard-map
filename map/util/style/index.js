import * as styledComponents from 'styled-components'
import { themeGet } from "@styled-system/theme-get"

import { theme } from './theme'

const {
  default: styled,
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
} = styledComponents

export {
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  theme,
  themeGet,
  // themePx,
}

export default styled
