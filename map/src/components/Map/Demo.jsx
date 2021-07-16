// simple, demo map for FCV and other organizations

import React, { useEffect, useRef, useState } from 'react'
import { Flex, Box, Text } from '@rebass/grid'
import mapboxgl from 'mapbox-gl'
import { fromJS } from 'immutable'
import { siteMetadata } from '../../../gatsby-config'
import { sources, layers, config } from '../../../config/map'
import { useData } from '../Data/regions'
import { useRepData } from '../Data/representatives'
import styled from '../../../util/style'
import LayerToggle from './LayerToggle'
import "typeface-lato";

const Wrapper = styled.div`
    height: 100%;
    font-family: 'Lato', sans-serif;
`

const MapContainer = styled.div`
    position: absolute;
    top: 59px;
    bottom: 0;
    left: 0;
    right: 0; 
`

const Sidebar = styled.div`
    position: absolute;
    overflow-y: auto;
    height: 200px;
    top: calc(47px + 30px);
    z-index: 4000;
    background-color: #fff;
    width: 340px;
    padding: 10px;
    border-radius: 0;
    color: #29323c;
    right: 30px;
    margin: auto;
    box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 1px 1px rgba(16, 22, 26, 0.2), 0 2px 6px rgba(16, 22, 26, 0.2);
`

// store mapbox token
const mapboxToken = siteMetadata.mapboxToken

// map component
const Demo = () => {

    if (!mapboxToken) {
        console.error(
            'ERROR: Mapbox token is required in gatsby-config.js siteMetadata'
        )
    }

    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const baseStyleRef = useRef(null) 
    const [activeLayer, setActiveLayer] = useState('upperFL') // toggle layers between upper FL and lower FL

    // data from MongoDB/GraphQL query
    // regions Data
    const [regionsData, regionsIndex] = useData()
    // representatives Data
    const [repData, repIndex] = useRepData()

    // initialize map when component mounts
    useEffect(() => {
        mapboxgl.accessToken = siteMetadata.mapboxToken
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/shelby-green/ckpe45kll0we417n7cgs8cxne`,
            center: [11.43, -10.082],
            zoom: 6, 
            minZoom: 2
        })

        mapRef.current = map
        window.map = map

        map.on('load', () => { 

            // snapshot existing map config
            baseStyleRef.current = fromJS(map.getStyle())
            window.baseStyle = baseStyleRef.current
            
            // add every source
            Object.entries(sources).forEach(([id, source]) => {
                map.addSource(id, source)
            })
            
            // add every layer to the map 
            // layers is an array of the individual layers
            layers.forEach(layer => {
                map.addLayer(layer)
            })

            map.resize();
        });

            //TODO: potentially a faster way than reloading geojson as source.
            //https://github.com/mapbox/mapbox-gl-js/issues/3018#issuecomment-277117802
    
        map.on('click', function(mapElement) {
            // when you click a point on the map, query the features under the point and store
            // in the variable 'features'
            const features = map.queryRenderedFeatures(mapElement.point, {
                layers: ['upperFL-fill', 'lowerFL-fill']
            })

            // also on click, get the ccid and the regions.incumbent.rep id
            // for the point that represents the clicked district
            const ccidCode = features[0].properties.ccid
            const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])

            // the lookup will find the data associated to the district
            // and relay the following information, stored the in the html variable
            // to be displayed in a tooltip

            const html_legname = `${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}`;
            const html_legparty = `${repIndex.getIn([incumbentId, 'party'])}`;
            const html_score = `${Math.round(repIndex.getIn([incumbentId, 'cc_score']))}`;
            
            // store html in the sidebar divs
            document.getElementById('name').innerHTML = html_legname
            document.getElementById('party').innerHTML = html_legparty
            document.getElementById('score').innerHTML = html_score

        });

        // change cursor to pointer when hovering over a district
        map.on('mouseenter', function(mapElement) {
            // when you hover over a point on the map, query the features under the point and store
            // in the variable 'features'
            const features = map.queryRenderedFeatures(mapElement.point, {
                layers: ['upperFL-fill', 'lowerFL-fill']
            })
            // if there's something under the point (the features variable is not null)
            // then change the style of the cursor to pointer
            // to signal that you can click here
            if (features.length) {
                map.getCanvas().style.cursor = 'pointer';
            }
        });

        // change the cursor back to the "grabbing" mouse when you're not hovering over a clickable feature -- which is just a district
        map.on('mouseleave', function () {
            map.getCanvas().style.cursor = '';
        });

        // clean up on unmount
        return () => map.remove();
    
    }, [])

    // toggle button functionality
    // onChange, chance the visibility of the upper and lower layers
    const handleLayerToggle = newLayer => {
        // rename the current view as map
        // and equal it to the map object
        const { current: map } = mapRef
        // if the map and map style haven't loaded, then don't continue
        if (!(map && map.isStyleLoaded)) return
        // set the activeLayer to the newLayer
        setActiveLayer(newLayer)
        // isUpper is a boolean
        // if the newLayer is upper, T
        // if the newLayer is lower, F
        const isUpper = newLayer === 'upperFL'
        // change the visibility of the upper layer to none if the newLayer is upper
        map.setLayoutProperty(
            'upperFL-fill',
            'visibility',
            isUpper ? 'visible' : 'none' // if the layer source is upper, and it's visible, then make it none
        )
        // change the visibility of the lower layer to visible if the newLayer is not lower
        map.setLayoutProperty(
            'lowerFL-fill',
            'visibility',
            isUpper ? 'none' : 'visible'
        )
    }

    return (
        <Wrapper>
        <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%' }}/>
        <Sidebar>
            <div id='name'></div>
            <div id='party'></div>
            <div id='score'></div>
            {/* {mapRef.current && mapRef.current.isStyleLoaded && (
                <> */}
                    <LayerToggle
                            value={activeLayer} // senate view; upper is the activeLayer on load
                            options={[
                                {value:'upperFL', label: 'Senate'},
                                {value:'lowerFL', label:'House'},
                            ]}
                            onChange={handleLayerToggle}
                        />
                {/* </>
            )} */}
            </Sidebar>
    </Wrapper>
    )

}

export default Demo