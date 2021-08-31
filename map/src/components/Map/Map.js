import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from '!mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { siteMetadata } from '../../../gatsby-config'
import { useData } from '../Data/regions'
import { sources, layers, chambers,state_bounds, senate_bounds, house_bounds, initialsToState, statesToCodes, chamberToLetter} from '../../../config/map'
import styled from '../../../util/style'
import "typeface-lato";
import './map.css'
import LegislatorSidebar from './LegislatorSidebar'


const Header = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1vh;
`;

// select elements
const SelectState = styled.select`
    height: 40px;
    background: white;
    color: #C36C27;
    font-size: 16px;
    font-weight: bold;
    font-family: 'Lato', sans-serif;
    border: 1px solid #C36C27;
    margin: 0px 0px 5px 0px;
    padding: 10px;
    @media only screen and (max-width: 500px) {
        height: 40px;
        font-size: 16px;
    }
    @media only screen and (min-width: 600px) {
        width: 32%;
    }
    &:disabled {
        opacity: 0.50
    }
`

const SelectChamber = styled.select`
    height: 40px;
    background: white;
    color: #333;
    font-size: 16px;
    font-weight: bold;
    font-family: 'Lato', sans-serif;
    border: 1px solid #333;
    margin: 0px 0px 5px 0px;
    padding: 10px;
    @media only screen and (max-width: 500px) {
        height: 40px;
        font-size: 16px;
    }
    @media only screen and (min-width: 600px) {
        width: 32%;
    }
`

const SelectDistrict = styled.select`
    height: 40px;
    background: white;
    color: #333;
    font-weight: bold;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
    border: 1px solid #333;
    margin: 0px 0px 5px 0px;
    padding: 10px;
    @media only screen and (max-width: 500px) {
        height: 40px;
        font-size: 16px;
    }
    @media only screen and (min-width: 600px) {
        width: 32%;
    }
`


// function to add leading zeros
const zeroPad = (num, places) => String(num).padStart(places, '0')

// store mapbox token
const mapboxToken = siteMetadata.mapboxToken

// map component
const Map = () => {

    // if there's no mapbox token, raise an error in the console
    if (!mapboxToken) {
        console.error(
            'ERROR: Mapbox token is required in gatsby-config.js siteMetadata'
        )
    }

    // this ref holds the map DOM node so that we can pass it into Mapbox GL
    const mapContainer = useRef(null)

    // this ref holds the map object once we have instantiated it, so that it
    // can be used in other hooks
    const mapRef = useRef(null)

    // data from MongoDB/GraphQL query
    // regions Data
    const [, regionsIndex] = useData()

    // set the initial ccid as null
    const [selectedCcid, setSelectedCcid] = useState(null);

    // set the initial instructions for state view
    const [instructions, setInstructions] = useState('Please Select A State');

    const [canSelectState, setCanSelectState] = useState(true);
    const [canSelectChamber, setCanSelectChamber] = useState(false);
    const [canSelectDistrict, setCanSelectDistrict] = useState(false);


    // initialize map when component mounts
    useEffect(() => {
        mapboxgl.accessToken = siteMetadata.mapboxToken

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/shelby-green/ckpe45kll0we417n7cgs8cxne`,
            center: [-1.14, -0.98],
            minZoom: 2,
            interactive: false
        })

        // if phone view, set zoom to 3.5
        if (window.matchMedia( "(min-width: 500px)" ).matches) {
            map.setZoom(3.5);
        } else {
            map.setZoom(2.5);
        }

        mapRef.current = map
        window.map = map

        // when the map loads
        map.on('load', () => {

            // make the cursor a pointer
            map.getCanvas().style.cursor = 'default';

            // add every source to the map
            Object.entries(sources).forEach(([id, source]) => {
                map.addSource(id, source)
            })

            // add every layer to the map
            layers.forEach(layer => {
                map.addLayer(layer)
            })

            // when a state is selected, zoom to it via bounds
            document.getElementById('state-select').addEventListener('change', function () {
                let selectedState = document.getElementById('state-select').value

                // Update the reset button
                // change reset color to black
                const reset = document.getElementById('reset');
                reset.style.color = "#000000"
                reset.classList.remove('hidden');

                // change instructions text
                setInstructions("Please Select A Chamber");
                // reset the chamber and district options
                document.getElementById('chamber-select').value = ""
                document.getElementById('district-select').value = ""
                // zoom to the bounds
                let bounds = state_bounds[selectedState]
                map.fitBounds(bounds)

                setCanSelectChamber(true);
                setCanSelectDistrict(true);
            })

            // when a chamber is selected, make it visible
            document.getElementById('chamber-select').addEventListener('change', function () {
                let selectedChamber = document.getElementById('chamber-select').value
                let selectedState = document.getElementById('state-select').value

                // reset district options
                document.getElementById('district-select').options.length = 1

                // populate district options
                // if change is house
                if (selectedState && selectedChamber === 'house') {
                    let districtOptions = Object.keys(house_bounds[selectedState])

                    // load the district options
                    const selectDistrict = document.getElementById('district-select')
                    for (let i = 0; i < districtOptions.length; i++) {
                        let currentDistrict = districtOptions[i]
                        let newOption = new Option(currentDistrict, currentDistrict)
                        selectDistrict.add(newOption, undefined)
                    }
                } else {
                    let districtOptions = Object.keys(senate_bounds[selectedState])

                    // load the district options
                    const selectDistrict = document.getElementById('district-select')
                    for (let i = 0; i < districtOptions.length; i++) {
                        let currentDistrict = districtOptions[i]
                        let newOption = new Option(currentDistrict, currentDistrict)
                        selectDistrict.add(newOption, undefined)
                    }
                }

                // change text and border to orange
                document.getElementById('chamber-select').style.color = "#C36C27"
                document.getElementById('chamber-select').style.borderColor = "#C36C27"

                // change district text and border to grey
                document.getElementById('district-select').style.color = "#333"
                document.getElementById('district-select').style.borderColor = "#333"

                // change instructions text
                setInstructions("Please Select A District");

                // change all layers visibility to none
                map.setLayoutProperty('senate-fill', 'visibility', 'none')
                map.setLayoutProperty('house-fill', 'visibility', 'none')

                // change the selected chamber's visibility to visible
                let clickedLayer = selectedChamber + '-fill'
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')

                // reset the district options
                document.getElementById('district-select').value = ""

                // zoom out to the state view
                let bounds = state_bounds[selectedState]
                map.fitBounds(bounds)

                // reset ccid 
                setSelectedCcid(null)

                document.getElementById('state-select').style.color = "#FFFFFF"
                document.getElementById('state-select').style.backgroundColor = "#C36C27"
                setCanSelectState(false);

            })

        });

        map.on('idle', function() {

            let selectedState = document.getElementById('state-select').value
            let selectedChamber = document.getElementById('chamber-select').value

            if (document.getElementById('chamber-select').value) {
                if (selectedState && selectedChamber === "house") {
                // when the district is selected, zoom to it
                document.getElementById('district-select').addEventListener('change', function () {
                    let selectedDistrict = document.getElementById('district-select').value
                    let bounds = house_bounds[selectedState][selectedDistrict]
                    setInstructions(null);

                    // change 'district' color and border to orange
                    document.getElementById('district-select').style.color = "#C36C27"
                    document.getElementById('district-select').style.borderColor = "#C36C27"

                    // zoom to the district
                    map.fitBounds(bounds)
                    // compute ccid for selected district
                    // this won't work for every use case -- mainly the multimember districts
                    const ccidCode = statesToCodes[selectedState.toUpperCase()] + zeroPad(selectedDistrict, 3) + chamberToLetter[selectedChamber]
                    console.log(ccidCode)
                    // set the ccid
                    setSelectedCcid(ccidCode);
                    })
                } else if (selectedState && selectedChamber === "senate") {
                    let selectedState = document.getElementById('state-select').value
                    let selectedChamber = document.getElementById('chamber-select').value

                    // when the district is selected, zoom in and populate legislator details
                    document.getElementById('district-select').addEventListener('change', function () {
                        // change 'district' color and border to orange
                        document.getElementById('district-select').style.color = "#C36C27"
                        document.getElementById('district-select').style.borderColor = "#C36C27"

                        setInstructions(null);

                        let selectedDistrict = document.getElementById('district-select').value
                        let bounds = senate_bounds[selectedState][selectedDistrict]
                        // zoom to the district
                        map.fitBounds(bounds)
                        // compute ccid for selected district
                        const ccidCode = statesToCodes[selectedState.toUpperCase()] + zeroPad(selectedDistrict, 3) + chamberToLetter[selectedChamber]

                        // set the ccid
                        setSelectedCcid(ccidCode);
                    })
                }

            }

            // reset the navigation options, and hide components, when the reset button is clicked
            document.getElementById('reset').addEventListener('click', function () {
                setCanSelectState(true);
                setCanSelectDistrict(false);
                setCanSelectChamber(false);

                // if mobile view, set zoom
                if (window.matchMedia( "(min-width: 500px)" ).matches) {
                    map.setZoom(3.5);
                } else {
                    map.setZoom(2.5);
                }
                

                setInstructions("Please Select A State");

                // reset styles
                document.getElementById('state-select').style.color = "#C36C27"
                document.getElementById('chamber-select').style.color = "#333"
                document.getElementById('district-select').style.color = "#333"
                document.getElementById('state-select').style.backgroundColor = "white"
                document.getElementById('chamber-select').style.backgroundColor = "white"
                document.getElementById('district-select').style.backgroundColor = "white"
                document.getElementById('chamber-select').style.borderColor = "#333"
                document.getElementById('district-select').style.borderColor = "#333"

                // reset navigation options
                document.getElementById('state-select').value = ""
                document.getElementById('chamber-select').value = ""
                document.getElementById('district-select').value = ""


                // change back to senate layer
                map.setLayoutProperty('senate-fill', 'visibility', 'visible')
                map.setLayoutProperty('house-fill', 'visibility', 'none')

                // zoom out to center
                map.flyTo({center: [-1.14, -0.98]})

                // Hide the reset button
                document.getElementById('reset').classList.add('hidden');

                // Unset selected ccid
                setSelectedCcid(null);

            })


        })

        map.on('click', function(mapElement) {
            // when you click a point on the map, query the features under the point and store
            // in the variable 'features'
            const features = map.queryRenderedFeatures(mapElement.point, {
                layers: ['house-fill', 'senate-fill']
            })

            const { properties } = features[0]
            const { ccid: ccidCode } = properties;
            
            // clear instructions
            setInstructions(null);

            // set the ccid
            setSelectedCcid(ccidCode);

        });

    }, [])

    const incumbentId = selectedCcid && regionsIndex.getIn([selectedCcid, 'incumbents', 0, 'rep']);
    const regionName = selectedCcid && regionsIndex.getIn([selectedCcid, 'name']);
    const incumbentsList = [];
    if (selectedCcid) {
        for (let i = 0; i < regionsIndex.getIn([selectedCcid, 'incumbents']).size; i++) {
            incumbentsList.push(regionsIndex.getIn([selectedCcid, 'incumbents', i, 'rep']))
        }
    }
    const isMMD = incumbentsList.length > 1;

    return (
        // container for the entire app
        <div className="wrapper">
            {/* map & navigation bar */}
            <div className="main">
                {/* navigation bar */}
                <div className="nav">
                    <Header>
                        <div className="mapText">Interactive Score Map</div>
                        <div id="reset" className="resetText hidden">RESET</div>
                    </Header>
                    <SelectState id="state-select" disabled={!canSelectState}>
                        <option value="" hidden>State</option>
                        {
                            Object.keys(state_bounds).sort().map(stateAbbrLowercase => (
                                <option key={stateAbbrLowercase} value={stateAbbrLowercase}>
                                    {initialsToState[stateAbbrLowercase]}
                                </option>
                            ))
                        }
                    </SelectState>
                    <SelectChamber id="chamber-select" disabled={!canSelectChamber}>
                        <option value="" hidden>Chamber</option>
                        {
                            Object.keys(chambers).map(chamber => (
                                <option key={chamber} value={chamber}>{chambers[chamber]}</option>
                            ))
                        }
                    </SelectChamber>
                    <SelectDistrict id="district-select" disabled={!canSelectDistrict}><option value="" hidden>District</option></SelectDistrict>
                </div>
                {/* map */}
                <div className="mapContainer">
                    <div className="map" ref={mapContainer} />
                </div>
                {/* legend */}
                <div className='my-legend'>
                    <div className='legend-scale'>
                        <div className='legend-labels'>
                            <div><span style={{background:'#808080'}}></span>NA</div>
                            <div><span style={{background:'#8C510A'}}></span>0</div>
                            <div><span style={{background:'#D8B365'}}></span>1-25</div>
                            <div><span style={{background:'#F6E8C3'}}></span>26-50</div>
                            <div><span style={{background:'#C7EAE5'}}></span>51-75</div>
                            <div><span style={{background:'#5AB4AC'}}></span>76-99</div>
                            <div><span style={{background:'#01665E'}}></span>100</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* sidebar */}
            <LegislatorSidebar
              key={incumbentId}
              representativeList={incumbentsList}
              isMMD={isMMD}
              representativeId={incumbentId}
              regionName={regionName}
              instructions={instructions}
            />
        </div>
    )

}



export default Map