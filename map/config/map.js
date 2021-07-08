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
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/FL-Senate.geojson',
    },
    lowerFL: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/house/FL-House.geojson',
    },
    upperGA: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/GA-Senate.geojson',
    },
    // upperAL: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/AL-Senate.geojson',
    // },
    // upperMS: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/MS-Senate.geojson',
    // },
    // upperLA: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/LA-Senate.geojson',
    // },
    // upperAR: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/AR-Senate.geojson',
    // },
    // upperTN: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/TN-Senate.geojson',
    // },
    // upperKY: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/KY-Senate.geojson',
    // },
    // upperWV: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/WV-Senate.geojson',
    // },
    // upperVA: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/VA-Senate.geojson',
    // },
    // upperNC: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/NC-Senate.geojson',
    // },
    // upperSC: {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/SC-Senate.geojson',
    // }
}

// TODO: make layer groups 
export const layers = [
    {
      id: "upperFL-fill",
      source: 'upperFL',
      type: 'fill',
      paint: { // TODO: choropleth, style by score
        // 'fill-color': 
        // ['case',
        //     ['!=', ['feature-state', 'cc_score'], null],
        //     ['interpolate',
        //         ['linear'],
        //         ['feature-state', 'cc_score'],
        //         20, '#BB0000', // if score is <= 20, then the color is a mix of gray and red
        //         70, '7F00BB', // if score is <= 70, then the color is a mix of red and purple
        //         100, '0061BB' // if score is <= 100, then the color is a mix of purple and blue
        //     ],    
        //     'rgb(140, 140, 140)'
        // ],
        'fill-color': 'orange',
        'fill-outline-color': 'white',
        'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6, // true, opacity is 0.6
            1 // false, opacity is 1
        ]
      },
      layout: {
        visibility: 'visible',
        },
    },
    {
        id: "lowerFL-fill",
        source: 'lowerFL',
        type: 'fill',
        paint: { // TODO: choropleth, style by score
          'fill-color': 'orange',
          'fill-outline-color': 'white'
        },
        layout: {
          visibility: 'none',
          },
    },
    {
        id: "upperGA-fill",
        source: 'upperGA',
        type: 'fill',
        paint: { // TODO: choropleth, style by score
          'fill-color': 'orange',
          'fill-outline-color': 'white'
        },
        layout: {
            visibility: 'visible',
        },
    },
    // {
    //     id: "upperAL-fill",
    //     source: 'upperAL',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperMS-fill",
    //     source: 'upperMS',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperLA-fill",
    //     source: 'upperLA',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperAR-fill",
    //     source: 'upperAR',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperTN-fill",
    //     source: 'upperTN',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperKY-fill",
    //     source: 'upperKY',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperVA-fill",
    //     source: 'upperVA',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperWV-fill",
    //     source: 'upperWV',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperNC-fill",
    //     source: 'upperNC',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // },
    // {
    //     id: "upperSC-fill",
    //     source: 'upperSC',
    //     type: 'fill',
    //     paint: { // TODO: choropleth, style by score
    //       'fill-color': 'orange',
    //       'fill-outline-color': 'white'
    //     },
    //     layout: {
    //         visibility: 'visible',
    //     },
    // }
]

// map navigation
export const filters = [
    {
        type: 'dropdown',
        columnHeader: 'State',
        listItems: [
            "Florida",
            "Georgia"
        ]
    }
]
