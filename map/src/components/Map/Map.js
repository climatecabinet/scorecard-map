import React, { useEffect, useRef, useState } from 'react'
import { Flex, Box } from '@rebass/grid'
import mapboxgl from '!mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
// import 'mapbox-gl/dist/mapbox-gl.js'
import { siteMetadata } from '../../../gatsby-config'
import { useData } from '../Data/regions'
import { useRepData } from '../Data/representatives'
import { sources, layers, chambers,state_bounds, senate_bounds, house_bounds, initialsToState} from '../../../config/map'
import styled from '../../../util/style'
import "typeface-lato";
import './map.css'

// select elements
const Select = styled.select`
    height: 50px;
    width: 32%;
    background: white;
    color: #333;
    font-size: 20px;
    font-family: 'Lato', sans-serif;
    border: 1px solid #C36C27;
    margin-bottom: 20px;
    padding: 10px;
`


// name element
const Name = styled(Box)`
  color: #C36C27;
  font-size: 26px;
  font-weight: 700;
  padding-top: 15px;
  padding-bottom: 10px;
`

// party element
const Party = styled(Box)`
  color: #000000;
  font-size: 24px;
  font-weight: 700;
  padding-bottom: 15px;
`

// score box
const ScoreBox = styled(Box)`
  background-color: white;
  width: 15vw;
  height: 13vh;
  margin-left: 15px;
  margin-right: 15px;
  padding-top: 10px;
  padding-bottom: 25px;
`

// score text element
const ScoreText = styled(Box)`
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    padding-bottom: 15px;
`

// numbers element
const Numbers = styled(Box)`
  font-size: 26px;
  color: #C36C27;
  text-align: center;
`

// votes box
const VotesBox = styled(Box)`
    margin-left: 15px;
    margin-top: 50px;
    margin-right: 15px;
`

// action box
const ActionBox = styled(Box)`
    width: 250px;
    margin-left: 15px;
    margin-bottom: 15px;
    background-color: #C36C27;
    color: white;
    text-align: center;
    font-size: 24px;
    text-transform: uppercase;
    padding: 10px 10px 10px 10px;
`

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
    const [regionsData, regionsIndex] = useData()
    // representatives Data
    const [repData, repIndex] = useRepData()

    // initialize map when component mounts
    useEffect(() => {
        mapboxgl.accessToken = siteMetadata.mapboxToken
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/shelby-green/ckpe45kll0we417n7cgs8cxne`,
            center: [-1.14, -0.98],
            zoom: 3.5, 
            // TODO: detect window size. change zoom based on window size.
            // desktop: 4.5
            // mobile/iPad: 2.5
            minZoom: 2
        })

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
                let bounds = state_bounds[selectedState]
                map.fitBounds(bounds)
            })

            // update the chamber element with the chamber options
            let chamberOptions = Object.keys(chambers)
            chamberOptions.sort();

            const selectChamber = document.getElementById('chamber-select')
            for (let i = 0; i < chamberOptions.length; i++) {
                let currentChamber = chamberOptions[i]
                let newOption = new Option(chambers[currentChamber], currentChamber)
                selectChamber.add(newOption, undefined)
            }

            // when a chamber is selected, make it visible
            document.getElementById('chamber-select').addEventListener('change', function () {
                let selectedChamber = document.getElementById('chamber-select').value
                
                // change all layers visibility to none
                map.setLayoutProperty('state-fill', 'visibility', 'none')
                map.setLayoutProperty('senate-fill', 'visibility', 'none')
                map.setLayoutProperty('house-fill', 'visibility', 'none')

                // change the selected chamber's visibility to visible
                let clickedLayer = selectedChamber + '-fill'
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')

                // change district to empty
                document.getElementById('district-select').innerHTML = ""

            })       
        
            // map.resize();
        });

        map.on('idle', function() {
            // update the district element with the district options
            if (document.getElementById('chamber-select').value) {
                let selectedChamber = document.getElementById('chamber-select').value
                let selectedState = document.getElementById('state-select').value
                console.log(selectedChamber)

                if (selectedChamber === 'house') {
                    let districtOptions = Object.keys(house_bounds[selectedState])

                    const selectDistrict = document.getElementById('district-select')
                    for (let i = 0; i < districtOptions.length; i++) {
                        let currentDistrict = districtOptions[i]
                        let newOption = new Option(currentDistrict, currentDistrict)
                        selectDistrict.add(newOption, undefined)
                    }

                    document.getElementById('district-select').addEventListener('change', function () {
                        let selectedDistrict = document.getElementById('district-select').value
                        let bounds = house_bounds[selectedState][selectedDistrict]
                        map.fitBounds(bounds)
                    })
                } else {
                    let districtOptions = Object.keys(senate_bounds[selectedState])

                    const selectDistrict = document.getElementById('district-select')
                    for (let i = 0; i < districtOptions.length; i++) {
                        let currentDistrict = districtOptions[i]
                        let newOption = new Option(currentDistrict, currentDistrict)
                        selectDistrict.add(newOption, undefined)
                    }

                    document.getElementById('district-select').addEventListener('change', function () {
                        let selectedDistrict = document.getElementById('district-select').value
                        let bounds = senate_bounds[selectedState][selectedDistrict]
                        map.fitBounds(bounds)
                    })
                }

            } else {
                console.log('no chamber selected yet')
            }

            // reset the navigation options if the reset button is clicked
            document.getElementById('reset').addEventListener('click', function () {
                // reset options
                document.getElementById('state-select').value = ""
                document.getElementById('chamber-select').value = ""
                document.getElementById('district-select').innerHTML = "District"
                document.getElementById('name').innerHTML = ""
                document.getElementById('party').innerHTML = ""
                document.getElementById('score').innerHTML = ""
                // change back to states layer
                map.setLayoutProperty('state-fill', 'visibility', 'visible')
                map.setLayoutProperty('senate-fill', 'visibility', 'none')
                map.setLayoutProperty('house-fill', 'visibility', 'none')
                // zoom out to center
                map.flyTo({center: [-1.14, -0.98], zoom: 3.5})


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
            const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])
            const legiscanCode = repIndex.getIn([incumbentId, 'legiscan_id'])
            // const rollCallCode = voteIndex.getIn([legiscanCode.toString(), 'roll_call_id'])
            // const billCode = rollCallIndex.getIn([rollCallCode.toString(), 'bill_id'])

            // use the ccidCode to lookup the regions data (stored in the regionsIndex variable) and the representatives data (stored in the repIndex variable)
            // the lookup will find the data associated to the district
            // and relay the following information, stored the in the html variable
            // to be displayed in a tooltip

            const html_legname = `${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}`;
            const html_legparty = `${repIndex.getIn([incumbentId, 'party'])}`;
            const html_score = `${Math.round(repIndex.getIn([incumbentId, 'cc_score']))}`;
            const html_vote1 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 0])}`;
            const html_vote2 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 1])}`;
            const html_vote3 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 2])}`;
            const html_vote4 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 3])}`;
            const html_vote5 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 4])}`;
            
            // store html in the sidebar divs
            document.getElementById('name').innerHTML = html_legname
            document.getElementById('party').innerHTML = html_legparty
            document.getElementById('score').innerHTML = html_score

            // store the votes in the hidden div
            if (html_vote1 === 'undefined') {
                document.getElementById('vote1').style.display = "none"
                document.getElementById('vote1').innerHTML = 'Vote information not available.'
            } else {
                document.getElementById('vote1').style.display = "none"
                document.getElementById('vote1').innerHTML = html_vote1
            }
            if (html_vote2 === 'undefined') {
                document.getElementById('vote2').style.display = "none"
                document.getElementById('vote2').innerHTML = 'Vote information not available.'
            } else {
                document.getElementById('vote2').style.display = "none"
                document.getElementById('vote2').innerHTML = html_vote2
            }
            if (html_vote3 === 'undefined') {
                document.getElementById('vote3').style.display = "none"
                document.getElementById('vote3').innerHTML = 'Vote information not available.'
            } else {
                document.getElementById('vote3').style.display = "none"
                document.getElementById('vote3').innerHTML = html_vote3
            }
            if (html_vote4 === 'undefined') {
                document.getElementById('vote4').style.display = "none"
                document.getElementById('vote4').innerHTML = 'Vote information not available.'
            } else {
                document.getElementById('vote4').style.display = "none"
                document.getElementById('vote4').innerHTML = html_vote4
            }
            if (html_vote5 === 'undefined') {
                document.getElementById('vote5').style.display = "none"
                document.getElementById('vote5').innerHTML = 'Vote information not available.'
            } else {
                document.getElementById('vote5').style.display = "none"
                document.getElementById('vote5').innerHTML = html_vote5
            }

            // when the vote item is clicked, make the vote appear
            document.getElementById('vote1Tab').addEventListener('click', function () {
                document.getElementById('vote1').style.display = 'block';
            });

            document.getElementById('vote2Tab').addEventListener('click', function () {
                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'block';
            });

            document.getElementById('vote3Tab').addEventListener('click', function () {
                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'block';
            });

            document.getElementById('vote4Tab').addEventListener('click', function () {
                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'block';
            });

            document.getElementById('vote5Tab').addEventListener('click', function () {
                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'none';
                document.getElementById('vote5').style.display = 'block';
            });

        });

        // // clean up on unmount
        // return () => {
        //     map.remove()
        // };
    
    }, [])

    return (
        // container for the entire app
        <div class="wrapper">
            {/* map & navigation bar */}
            <div class="main">
                {/* navigation bar */}
                <div class="nav">
                    <div class="mapText">Interactive Map</div>
                    <div id = "reset" class="resetText">RESET</div>
                    <br/><br/><br/>
                    <Select id="state-select"><option value="" hidden>State</option></Select>
                    <Select id="chamber-select" style={{marginLeft: '10px'}}><option value="" hidden>Chamber</option></Select>
                    <Select id="district-select" style={{marginLeft: '10px'}}><option value="" hidden>District</option></Select>
                </div>
                {/* map */}
                <div class="map" ref={mapContainer}></div>
                {/* map legend */}
                <div class='my-legend'>
			        <div class='legend-scale'>
				        <ul class='legend-labels'>
                            <li><span style={{background:'#8C510A'}}></span>0</li>
                            <li><span style={{background:'#D8B365'}}></span>1-25</li>
                            <li><span style={{background:'#F6E8C3'}}></span>26-50</li>
                            <li><span style={{background:'#C7EAE5'}}></span>51-75</li>
                            <li><span style={{background:'#5AB4AC'}}></span>76-99</li>
                            <li><span style={{background:'#01665E'}}></span>100</li>
				        </ul>
                    </div>
                </div>
            </div>
            {/* sidebar */}
            <div class="aside aside-2">
                <div class="candidateText">CANDIDATE DETAILS</div>
                <br/>
                <Name id='name' style={{marginLeft: '15px'}}></Name>
                <Party id='party' style={{marginLeft: '15px'}}></Party>
                <Flex>
                    <ScoreBox>
                        <ScoreText>Climate Cabinet Score</ScoreText>
                        <Numbers id='score'></Numbers>
                    </ScoreBox>
                    {/* <ScoreBox>
                        <ScoreText>Last Presidential Result</ScoreText>
                        <Numbers id='result'></Numbers>
                    </ScoreBox> */}
                </Flex>
                <VotesBox>
                    <div class="votesText">Past Climate Votes</div>
                    <div id='vote5Tab' class="vote5Tab">Vote 5</div>
                    <div id='vote4Tab' class="vote4Tab">Vote 4</div>
                    <div id='vote3Tab' class="vote3Tab">Vote 3</div>
                    <div id='vote2Tab' class="vote2Tab">Vote 2</div>
                    <div id='vote1Tab' class="vote1Tab">Vote 1</div>
                    <br/>
                    <br/>
                    <div id="vote1" class="vote1"></div>
                    <div id="vote2" class="vote2"></div>
                    <div id="vote3" class="vote3"></div>
                    <div id="vote4" class="vote4"></div>
                    <div id="vote5" class="vote5"></div>
                </VotesBox>
            </div>
        </div>
    )

}

export default Map