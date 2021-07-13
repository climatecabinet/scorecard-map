/**
 * Map configuration information used to construct map and populate layers
 */

// initial conditions
export const config = {
    accessToken: "pk.eyJ1IjoicGFzaWgiLCJhIjoiY2pybzJqdTVjMHJzeDQ0bW80aGdzaXV3ayJ9.yxD8Nqu7FLnf8-lBo7F1zQ",
    minZoom: 2,
    padding: 0.1
}

// sources for the map layers
export const sources = {
    upperFL: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/test-FL-Senate.geojson',
    },
    lowerFL: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/test-FL-House.geojson',
    },
    // upperGA: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/GA-Senate.geojson',
    // },
}

// TODO: make layer groups for states, senate, and house, with the help of ArcGIS tilesets
export const layers = [
    {
      id: "upperFL-fill",
      source: 'upperFL',
      type: 'fill',
      paint: { // TODO: change choropleth color scheme
        'fill-color': {
            property: 'cc_score',
            stops: [
                [0, '#BB0000'], // red
                [10, '#BB0000'],
                [20, '#7F00BB'], // purple
                [30, '#7F00BB'],
                [40, '#7F00BB'],
                [50, '#7F00BB'],
                [60, '#7F00BB'],
                [70, '#0061BB'], // blue
                [80, '#0061BB'],
                [90, '#0061BB'],
                [100, '#0061BB']
            ]
        },
        'fill-outline-color': 'white',
        'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6, // if true, opacity is 0.6
            1 // if false, opacity is 1
        ]
      },
      layout: {
        visibility: 'visible'
        },
    },
    {
        id: "lowerFL-fill",
        source: 'lowerFL',
        type: 'fill',
        paint: { 
            'fill-color': {
                property: 'cc_score',
                stops: [
                    [0, '#BB0000'], // red
                    [10, '#BB0000'],
                    [20, '#7F00BB'], // purple
                    [30, '#7F00BB'],
                    [40, '#7F00BB'],
                    [50, '#7F00BB'],
                    [60, '#7F00BB'],
                    [70, '#0061BB'], // blue
                    [80, '#0061BB'],
                    [90, '#0061BB'],
                    [100, '#0061BB']
                ],
          'fill-outline-color': 'white'
        },
        layout: {
          visibility: 'none',
        },
    },
}
]

// bounds for the senate districts
export const senate_bounds = {
    fl: {
        7: [-81.305, 29.63, 0.955],
		27: [-82.0, 26.58, 0.286],
		34: [-80.135, 26.15, 0.083],
		6: [-81.7, 30.325, 0.081],
		31: [-80.095, 26.545, 0.057],
		14: [-80.925, 28.71, 0.837],
		26: [-81.39, 27.345, 1.889],
		37: [-80.205, 25.67, 0.092],
		40: [-80.39, 25.66, 0.029],
		33: [-80.205, 26.19, 0.034],
		36: [-80.355, 25.865, 0.048],
		19: [-82.5, 27.85, 0.193],
		25: [-80.455, 27.12, 0.766],
		4: [-81.685, 30.465, 0.533],
		28: [-81.405, 26.365, 1.273],
		12: [-81.89, 28.795, 1.048],
		35: [-80.3, 25.935, 0.048],
		1: [-87.08, 30.615, 0.847],
		38: [-80.145, 25.865, 0.044],
		13: [-81.135, 28.535, 0.101],
		23: [-82.385, 27.08, 0.403],
		2: [-85.83, 30.45, 2.134],
		11: [-81.495, 28.62, 0.112],
		32: [-80.53, 26.145, 0.259],
		18: [-82.52, 27.995, 0.091],
		3: [-84.06, 30.125, 3.299],
		29: [-80.445, 26.475, 0.472],
		8: [-82.045, 29.535, 1.021],
		22: [-81.705, 28.29, 0.554],
		15: [-81.26, 28.09, 0.72],
		30: [-80.14, 26.78, 0.129],
		24: [-82.725, 27.79, 0.133],
		16: [-82.78, 28.135, 0.107]
    }
}

// bounds for the house districts
export const house_bounds = {
    fl: {
        86: [-80.235, 26.67, 0.046],
		26: [-81.19, 29.11, 0.151],
		7: [-84.175, 30.105, 2.927],
		36: [-82.775, 28.3, 0.07],
		92: [-80.15, 26.25, 0.016],
		38: [-82.25, 28.325, 0.124],
		90: [-80.125, 26.59, 0.013],
		93: [-80.08, 26.21, 0.029],
		2: [-87.22, 30.38, 0.18],
		39: [-81.79, 28.15, 0.269],
		71: [-82.675, 27.44, 0.099],
		106: [-81.625, 26.05, 0.319],
		3: [-86.85, 30.66, 0.626],
		73: [-82.3, 27.43, 0.22],
		85: [-80.255, 26.82, 0.154],
		63: [-82.385, 28.1, 0.035],
		68: [-82.645, 27.85, 0.038],
		45: [-81.535, 28.64, 0.05],
		13: [-81.625, 30.345, 0.025],
		23: [-81.895, 29.24, 0.286],
		54: [-80.57, 27.665, 0.242],
		98: [-80.295, 26.12, 0.016],
		83: [-80.285, 27.235, 0.066],
		66: [-82.82, 27.91, 0.04],
		51: [-80.685, 28.52, 0.232],
		10: [-82.68, 30.22, 1.033],
		8: [-84.58, 30.515, 0.273],
		5: [-85.63, 30.605, 1.217],
		97: [-80.555, 26.225, 0.136],
		24: [-81.34, 29.445, 0.578],
		17: [-81.445, 30.03, 0.216],
		75: [-82.0, 26.905, 0.238],
		56: [-81.795, 27.5, 0.498],
		94: [-80.19, 26.135, 0.011],
		87: [-80.1, 26.655, 0.011],
		40: [-81.965, 28.035, 0.032],
		112: [-80.185, 25.71, 0.027],
		19: [-82.005, 29.73, 0.943],
		62: [-82.535, 28.005, 0.02],
		47: [-81.365, 28.525, 0.019],
		35: [-82.4, 28.56, 0.182],
		113: [-80.15, 25.795, 0.027],
		49: [-81.215, 28.56, 0.019],
		79: [-81.75, 26.645, 0.095],
		64: [-82.59, 28.075, 0.046],
		6: [-85.695, 30.125, 0.275],
		118: [-80.41, 25.68, 0.013],
		50: [-81.035, 28.57, 0.242],
		115: [-80.345, 25.715, 0.021],
		21: [-82.91, 29.595, 0.787],
		65: [-82.775, 28.085, 0.043],
		25: [-81.005, 29.16, 0.164],
		91: [-80.125, 26.43, 0.018],
		12: [-81.53, 30.32, 0.025],
		67: [-82.695, 27.94, 0.027],
		89: [-80.045, 26.565, 0.074],
		60: [-82.51, 27.86, 0.101],
		111: [-80.265, 25.825, 0.01],
		95: [-80.235, 26.185, 0.006],
		74: [-82.31, 27.11, 0.16],
		100: [-80.105, 25.98, 0.029],
		30: [-81.345, 28.64, 0.018],
		52: [-80.675, 28.165, 0.093],
		34: [-82.51, 28.785, 0.36],
		53: [-80.63, 27.955, 0.13],
		37: [-82.55, 28.3, 0.078],
		33: [-82.03, 28.67, 0.403],
		99: [-80.24, 26.065, 0.02],
		58: [-82.23, 28.05, 0.082],
		28: [-81.16, 28.72, 0.075],
		57: [-82.25, 27.795, 0.116],
		119: [-80.445, 25.71, 0.007],
		109: [-80.24, 25.855, 0.015],
		11: [-81.685, 30.54, 0.423],
		32: [-81.805, 28.6, 0.155],
		61: [-82.41, 27.98, 0.029],
		29: [-81.365, 28.77, 0.042],
		108: [-80.19, 25.87, 0.01],
		116: [-80.36, 25.75, 0.01],
		15: [-81.85, 30.28, 0.072],
		44: [-81.535, 28.46, 0.055],
		41: [-81.63, 28.085, 0.106],
		16: [-81.56, 30.2, 0.052]
    }
}

// dictionary: state abbreviation to state
export const initialsToState = {
    fl: 'Florida',
	ga: 'Georgia'
}
