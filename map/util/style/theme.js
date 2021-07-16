const breakpoints = ['40em', '52em', '64em']

// generated using:
// https://palx.jxnblk.com/
const colors = {
  pageBackground: '#f9f9fa',
  white: 'hsl(0, 0%, 100%)',
  black: 'hsl(0, 0%, 0%)',
  link: '#1488ee',
  primary: { // indigo
    100: '#ebedf9', 
    300: '#ced1f0', 
    500: '#aaafe5', 
    800: '#6067a9', 
    900: '#383c63', 
  },
  secondary: { // blue
    100: '#e4eff7',
    200: '#d0e4f1',
    300: '#bad7ea',
    400: '#a2c9e3',
    500: '#86b9db',
    600: '#72a6c8',
    700: '#628eac',
    800: '#4d7088',
    900: '#2d424f',
  },
  highlight: { // violet
    100: '#f1ebf9', 
    200: '#e6ddf5', 
    300: '#dbcdf0', 
    400: '#cebceb', 
    500: '#c0a8e5', 
    600: '#b092de', 
    700: '#9c77d2', 
    800: '#7b5ea6',
    900: '#483761', 
  },
  grey: {
    100: '#ededf1', 
    200: '#e0e0e6',
    300: '#d1d2db',
    400: '#c2c3cf',
    500: '#b0b2c1',
    600: '#9d9fb1',
    700: '#868898',
    800: '#6a6b78',
    900: '#3e3f46',
  },
}

const space = [0, 4, 8, 16, 32, 64, 128, 256, 512]

const fontSizes = [12, 14, 16, 20, 24, 32, 48, 64, 96, 128]

const lineHeights = [1, 1.125, 1.25, 1.5]

const fontWeights = {
  normal: 400,
  semibold: 600,
}

/**
 * Letter-spacing should vary, depending on usage of text
 */
const letterSpacings = {
  normal: 'normal',
  caps: '0.25em',
  labels: '0.05em',
}

/**
 * Border-radius
 */
const radii = [0, 2, 4, 8, 16]

const buttons = {
  default: {
    backgroundColor: colors.grey[900],
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.primary[300],
  },
  disabled: {
    backgroundColor: colors.grey[300],
  },
}

export const theme = {
  name: 'Default',
  breakpoints,
  colors,
  buttons,
  space,
  fontSizes,
  lineHeights,
  fontWeights,
  letterSpacings,
  radii,
}
