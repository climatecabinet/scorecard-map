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
    height: 50px;
    background: white;
    color: #C36C27;
    font-size: 20px;
    font-weight: bold;
    font-family: 'Lato', sans-serif;
    border: 1px solid #C36C27;
    margin: 0px 0px 20px 0px;
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
    height: 50px;
    background: white;
    color: #333;
    font-size: 20px;
    font-weight: bold;
    font-family: 'Lato', sans-serif;
    border: 1px solid #333;
    margin: 0px 0px 20px 0px;
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
    height: 50px;
    background: white;
    color: #333;
    font-weight: bold;
    font-size: 20px;
    font-family: 'Lato', sans-serif;
    border: 1px solid #333;
    margin: 0px 0px 20px 0px;
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

    const [selectedCcid, setSelectedCcid] = useState(null);
    const [instructions, setInstructions] = useState('Please Select A State');
    // initialize map when component mounts
    useEffect(() => {
        mapboxgl.accessToken = siteMetadata.mapboxToken

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/shelby-green/ckpe45kll0we417n7cgs8cxne`,
            center: [-1.14, -0.98],
            minZoom: 2
        })

        // if phone view, set zoom to 3.5 and disable scroll
        if (window.matchMedia( "(min-width: 550px)" ).matches) {
            map.setZoom(3.5)
            map.dragPan.disable();
            map.scrollZoom.disable();
            map.touchPitch.disable()
            map.on('touchstart', function(e) {
                var oe = e.originalEvent;
                if (oe && 'touches' in oe) {
                    if (oe.touches.length > 1) {
                        oe.stopImmediatePropagation();
                        map.dragPan.enable();
                    } else {
                        map.dragPan.disable();
                    }
                }
            });
        } else {
            map.setZoom(2.5)
        }

        // disable scroll zoom
        map.scrollZoom.disable();

        mapRef.current = map
        window.map = map

        map.on('load', () => {

            // make a pointer cursor
            map.getCanvas().style.cursor = 'default';

            // add every source to the map
            Object.entries(sources).forEach(([id, source]) => {
                map.addSource(id, source)
            })

            // add every layer to the map
            layers.forEach(layer => {
                map.addLayer(layer)
            })

            // create a list of states using their abbreviations
            // and sort in alphabetical order
            let states = Object.keys(state_bounds)
            states.sort();

            // update the state element with state options
            const selectElement = document.getElementById('state-select')
            for (let i = 0; i < states.length; i++) {
                let currentState = states[i];
                let newOption = new Option(initialsToState[currentState], currentState);
                selectElement.add(newOption, undefined);
            }

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
                // make chamber and district available
                document.getElementById('chamber-select').disabled = false
                document.getElementById('district-select').disabled = false
            })

            // update the chamber element with the chamber options
            let chamberOptions = Object.keys(chambers)

            const selectChamber = document.getElementById('chamber-select')
            for (let i = 0; i < chamberOptions.length; i++) {
                let currentChamber = chamberOptions[i]
                let newOption = new Option(chambers[currentChamber], currentChamber)
                selectChamber.add(newOption, undefined)
            }

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
                map.setLayoutProperty('state-fill', 'visibility', 'none')
                map.setLayoutProperty('senate-fill', 'visibility', 'none')
                map.setLayoutProperty('house-fill', 'visibility', 'none')

                // change the selected chamber's visibility to visible
                let clickedLayer = selectedChamber + '-fill'
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')

                // reset the district options
                document.getElementById('district-select').value = ""

                // TODO: zoom out to the state view

                document.getElementById('state-select').style.color = "#FFFFFF"
                document.getElementById('state-select').style.backgroundColor = "#C36C27"
                document.getElementById('state-select').disabled = true

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
                    const ccidCode = statesToCodes[selectedState.toUpperCase()] + zeroPad(selectedDistrict, 3) + chamberToLetter[selectedChamber]
                    // populate the legislator details
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

                        setSelectedCcid(ccidCode);
                    })
                }

            } else {
                console.log('no chamber selected yet')
            }

            // reset the navigation options, and hide components, when the reset button is clicked
            document.getElementById('reset').addEventListener('click', function () {

                // if mobile view, set zoom and disable scroll
                if (window.matchMedia( "(min-width: 550px)" ).matches) {
                    map.setZoom(3.5)
                    map.dragPan.disable();
                    map.scrollZoom.disable();
                    map.touchPitch.disable()
                    map.on('touchstart', function(e) {
                        var oe = e.originalEvent;
                        if (oe && 'touches' in oe) {
                            if (oe.touches.length > 1) {
                                oe.stopImmediatePropagation();
                                map.dragPan.enable();
                            } else {
                                map.dragPan.disable();
                            }
                        }
                    });
                } else {
                    map.setZoom(2.5)
                }
                
                document.getElementById('state-select').disabled = false
                document.getElementById('chamber-select').disabled = true
                document.getElementById('district-select').disabled = true

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
                map.setLayoutProperty('state-fill', 'visibility', 'none')
                map.setLayoutProperty('senate-fill', 'visibility', 'visible')
                map.setLayoutProperty('house-fill', 'visibility', 'none')
                // zoom out to center
                map.flyTo({center: [-1.14, -0.98], zoom: 3.5})

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

            // also on click, get the ccid and the regions.incumbent.rep id
            // for the point that represents the clicked district
            const ccidCode = features[0].properties.ccid

            setSelectedCcid(ccidCode);

        });

    }, [])

    const incumbentId = selectedCcid && regionsIndex.getIn([selectedCcid, 'incumbents', 0, 'rep']);
    const regionName = selectedCcid && regionsIndex.getIn([selectedCcid, 'name']);

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
                    <div className="selects-container">
                        <SelectState id="state-select"><option value="" hidden>State</option></SelectState>
                        <SelectChamber id="chamber-select"><option value="" hidden>Chamber</option></SelectChamber>
                        <SelectDistrict id="district-select"><option value="" hidden>District</option></SelectDistrict>
                    </div>
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
              representativeId={incumbentId}
              regionName={regionName}
              instructions={instructions}
            />
        </div>
    )

}



export default Map