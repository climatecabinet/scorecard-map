import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { fromJS } from 'immutable'
import { siteMetadata } from '../../../gatsby-config'
import { sources, layers, config } from '../../../config/map'
import { useData } from '../Data/regions'
import { useRepData } from '../Data/representatives'
import { useVoteData } from '../Data/votes'
import { useRollCallData } from '../Data/rollCalls'
import { useBillData } from '../Data/bills'
import styled from '../../../util/style'

const Wrapper = styled.div`
    height: 100%;
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

const mapboxToken = siteMetadata.mapboxToken

const Map = () => {

    if (!mapboxToken) {
        console.error(
            'ERROR: Mapbox token is required in gatsby-config.js siteMetadata'
        )
    }

    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const baseStyleRef = useRef(null) 
    // const [activeLayer, setActiveLayer] = useState('upperNJ') // TODO: change options are upper, lower, and va

    // data from MongoDB/GraphQL query
    // regions Data
    const [regionsData, regionsIndex] = useData()
    // representatives Data
    const [repData, repIndex] = useRepData()
    // votes data
    const [voteData, voteIndex] = useVoteData()
    // roll calls data
    const [rollCallData, rollCallIndex] = useRollCallData()
    // bill data
    const [billData, billIndex] = useBillData()

    // initialize map when component mounts
    useEffect(() => {
        mapboxgl.accessToken = siteMetadata.mapboxToken
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/shelby-green/ckpe45kll0we417n7cgs8cxne`,
            center: [11.43, -10.082],
            zoom: 5.5, 
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
                layers: ['upperFL-fill', 'upperGA-fill']
            })

            // also on click, get the ccid and the regions.incumbent.rep id
            // for the point that represents the clicked district
            const ccidCode = features[0].properties.ccid
            const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])
            const legiscanCode = repIndex.getIn([incumbentId, 'legiscan_id'])
            const rollCallCode = voteIndex.getIn([legiscanCode.toString(), 'roll_call_id'])
            // const billCode = rollCallIndex.getIn([rollCallCode.toString(), 'bill_id'])

            // use the ccidCode to lookup the regions data (stored in the regionsIndex variable) and the representatives data (stored in the repIndex variable)
            // the lookup will find the data associated to the district
            // and relay the following information, stored the in the html variable
            // to be displayed in a tooltip

            // TODO:
            // round to the next integer for the the Score
            const html = `
                <center><strong>${regionsIndex.getIn([ccidCode, 'state_abbr'])}, Senate, ${parseInt(regionsIndex.getIn([ccidCode, 'district_no']), 10)}</strong></center>
                <br/>
                <strong>${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}</strong>
                <br />
                <strong>${repIndex.getIn([incumbentId, 'party'])}</strong> 
                <br />
                <strong>Climate Cabinet Score:</strong>  ${repIndex.getIn([incumbentId, 'cc_score'])} 
                <br/>
                <strong>Last Presidential Result:</strong>  NA
                <br/>
                Past Climate Votes -- Vote 1, Vote 2, Vote 3, Vote 4, Vote 5
                
                <br/>
                <br/>

            `; 
            // ${billIndex.getIn([billCode.toString(), 'description'])}

            // create tooltip variable for the floating card div
            const tooltip = document.getElementById('floating-card')
            
            // store html in the tooltip, which will be displayed in the floating card div
            tooltip.innerHTML = html
            // // TODO: add if else statement to show county vs counties when counties count > 1

        });

        // change cursor to pointer when hovering over a district
        map.on('mouseenter', function(mapElement) {
            // when you hover over a point on the map, query the features under the point and store
            // in the variable 'features'
            const features = map.queryRenderedFeatures(mapElement.point, {
                layers: ['upperFL-fill', 'upperGA-fill']
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
    // const handleLayerToggle = newLayer => {
    //     // rename the current view as map
    //     // and equal it to the map object
    //     const { current: map } = mapRef
    //     // if the map and map style haven't loaded, then don't continue
    //     if (!(map && map.isStyleLoaded)) return
    //     // set the activeLayer to the newLayer
    //     setActiveLayer(newLayer)
    //     // isUpper is a boolean
    //     // if the newLayer is upper, T
    //     // if the newLayer is lower, F
    //     const isUpper = newLayer === 'upperNJ'
    //     // change the visibility of the upper layer to none if the newLayer is upper
    //     map.setLayoutProperty(
    //         'upperNJ-fill',
    //         'visibility',
    //         isUpper ? 'visible' : 'none' // if the layer source is upper, and it's visible, then make it none
    //     )
    //     // change the visibility of the lower layer to visible if the newLayer is not lower
    //     map.setLayoutProperty(
    //         'lowerNJ-fill',
    //         'visibility',
    //         isUpper ? 'none' : 'visible'
    //     )
    // }

    return (
    <Wrapper>
        <MapContainer ref={mapContainer} style={{ width: '100%', height: '100%' }}/>
        <Sidebar>
            <div id="floating-card">
                <b>Legislator Details</b>
            </div>
            {/* {mapRef.current && mapRef.current.isStyleLoaded && (
                <> */}
                    {/* <LayerToggle
                            value={activeLayer} // senate view; upper is the activeLayer on load
                            options={[
                                {value:'upperNJ', label: 'Senate'},
                                {value:'lowerNJ', label:'House'},
                            ]}
                            onChange={handleLayerToggle}
                        /> */}
                {/* </>
            )} */}
            </Sidebar>
    </Wrapper>
    )

}

export default Map

{/* <strong>In the ${regionsIndex.getIn([ccidCode, 'fragments']).count()} counties that make up ${regionsIndex.getIn([ccidCode, 'state_abbr'])} State District ${parseInt(regionsIndex.getIn([ccidCode, 'district_no']), 10)}...</strong>
<br /> */}