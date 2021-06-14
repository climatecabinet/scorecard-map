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
    upperGA: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/climatecabinet/scorecard-map/main/data/geospatial/reprojected-state-leg/senate/GA-Senate.geojson',
    },
}

// TODO: make layer groups so i can style NJ and VA at the same time. via 1 stateLayer 
export const layers = [
    {
      id: "upperFL-fill",
      source: 'upperFL',
      type: 'fill',
      paint: { // put choropleth options
        'fill-color': 'orange',
        'fill-outline-color': 'white'
      },
      layout: {
        visibility: 'visible',
        },
    },
    {
        id: "upperGA-fill",
        source: 'upperGA',
        type: 'fill',
        paint: { // put choropleth options
          'fill-color': 'orange',
          'fill-outline-color': 'white'
        },
        layout: {
            visibility: 'visible',
        },
    },
    // {
    //     id: "upper-line",
    //     source: "upper",
    //     type: 'line',
    //     paint: {
    //         'line-color': '#FFFFFF',
    //         'line-width': 6
    //   },
    // },
]
