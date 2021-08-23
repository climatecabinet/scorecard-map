import React, { useEffect, useRef } from 'react'
import { Flex, Box } from '@rebass/grid'
import mapboxgl from '!mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { siteMetadata } from '../../../gatsby-config'
import { useData } from '../Data/regions'
import { useRepData } from '../Data/representatives'
import { sources, layers, chambers,state_bounds, senate_bounds, house_bounds, initialsToState, statesToCodes, chamberToLetter} from '../../../config/map'
import styled from '../../../util/style'
import "typeface-lato";
import './map.css'
import { remove } from 'immutable'

const LEGISLATOR_PAGE_URL_PREFIX = 'https://www.climatecabinetaction.org/legislator-pages/';

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
    margin-bottom: 20px;
    padding: 10px;
    @media only screen and (min-width: 1060px) {
        width: 32.5%;
    }
    @media only screen and (max-width: 1059px) {
        width: 31.25vw;
    }
    @media only screen and (max-width: 895px) {
        display: block;
        width: 95.75vw;
    }
    @media only screen and (max-width: 500px) {
        height: 40px;
        font-size: 16px;
        padding: 0px 5px 0px 10px;
        width: 469px;
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
    margin-bottom: 20px;
    padding: 10px;
    @media only screen and (min-width: 1060px) {
        width: 32.5%;
        margin-left: 12px;
    }
    @media only screen and (max-width: 1059px) {
        width: 31.25vw;
        margin-left: 10px;
    }
    @media only screen and (max-width: 895px) {
        display: block;
        width: 95.75vw;
        margin-left: 0px;
    }
    @media only screen and (max-width: 500px) {
        height: 40px;
        width: 469px;
        font-size: 16px;
        padding: 0px 5px 0px 10px;
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
    margin-bottom: 20px;
    padding: 10px;
    @media only screen and (min-width: 1060px) {
        width: 32.5%;
        margin-left: 12px;
    }
    @media only screen and (max-width: 1059px) {
        width: 31.25vw;
        margin-left: 10px;
    }
    @media only screen and (max-width: 895px) {
        display: block;
        width: 95.75vw;
        margin-left: 0px;
    }
    @media only screen and (max-width: 500px) {
        height: 40px;
        font-size: 16px;
        padding: 0px 5px 0px 10px;
        width: 469px;
    }
`


// name element
const Name = styled(Box)`
  color: #C36C27;
  font-size: 26px;
  font-weight: 700;
  padding-top: 15px;
  padding-bottom: 10px;
`

// votes box
const VotesBox = styled(Box)`
    margin-left: 15px;
    margin-top: 50px;
    margin-right: 15px;
`

// function to add leading zeros
const zeroPad = (num, places) => String(num).padStart(places, '0')

// store mapbox token
const mapboxToken = siteMetadata.mapboxToken

// map component
const Map = ({data}) => {

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
    // representatives Data
    const [, repIndex] = useRepData()

    // function to remove all district options
    function removeAll(selectBox) {
        if (selectBox) {
            while (selectBox.options.length > 0) {
                selectBox.remove(0);
            }
        }
    }

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
                document.getElementById('instructions').innerHTML = "Please Select A Chamber"
                // reset the chamber and district options
                document.getElementById('chamber-select').value = ""
                document.getElementById('district-select').value = ""
                // reset legislator details
                document.getElementById('details').style.visibility = "hidden"
                document.getElementById('name').innerHTML = ""
                document.getElementById('party').innerHTML = ""
                document.getElementById('score').innerHTML = ""
                document.getElementById('rep').innerHTML = ""
                document.getElementById('vote1').innerHTML = ""
                document.getElementById('vote2').innerHTML = ""
                document.getElementById('vote3').innerHTML = ""
                document.getElementById('vote4').innerHTML = ""
                document.getElementById('vote5').innerHTML = ""
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
                document.getElementById('instructions').innerHTML = "Please Select A District"

                // change all layers visibility to none
                map.setLayoutProperty('state-fill', 'visibility', 'none')
                map.setLayoutProperty('senate-fill', 'visibility', 'none')
                map.setLayoutProperty('house-fill', 'visibility', 'none')

                // change the selected chamber's visibility to visible
                let clickedLayer = selectedChamber + '-fill'
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')

                // reset the district options
                document.getElementById('district-select').value = ""

                // reset legislator details
                document.getElementById('details').style.visibility = "hidden"
                document.getElementById('name').innerHTML = ""
                document.getElementById('party').innerHTML = ""
                document.getElementById('score').innerHTML = ""
                document.getElementById('rep').innerHTML = ""
                document.getElementById('vote1').innerHTML = ""
                document.getElementById('vote2').innerHTML = ""
                document.getElementById('vote3').innerHTML = ""
                document.getElementById('vote4').innerHTML = ""
                document.getElementById('vote5').innerHTML = ""

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
                    // hide instructions text
                    document.getElementById('instructions').style.display = "none"

                    // change 'district' color and border to orange
                    document.getElementById('district-select').style.color = "#C36C27"
                    document.getElementById('district-select').style.borderColor = "#C36C27"

                    // zoom to the district
                    map.fitBounds(bounds)
                    // compute ccid for selected district
                    const ccidCode = statesToCodes[selectedState.toUpperCase()] + zeroPad(selectedDistrict, 3) + chamberToLetter[selectedChamber]
                    // populate the legislator details
                    const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])

                    // run query
                    // console.log(data.allMongodbRegions.representatives.full_name)

                    // make the contents of the legislator details component visible
                    document.getElementById('details').style.visibility = "visible"
                    const html_legname = `${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}`;
                    const html_legrep = `${initialsToState[repIndex.getIn([incumbentId, 'state_abbr']).toLowerCase()]} ${regionsIndex.getIn([ccidCode, 'name'])}`;
                    const html_score = `${Math.round(repIndex.getIn([incumbentId, 'cc_score']))}`;
                    const html_party = `${repIndex.getIn([incumbentId, 'party'])}`;
                    const html_vote1 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 0])}`;
                    const html_vote2 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 1])}`;
                    const html_vote3 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 2])}`;
                    const html_vote4 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 3])}`;
                    const html_vote5 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 4])}`;

                    // Update html in the sidebar divs
                    document.getElementById('name').innerHTML = html_legname
                    document.getElementById('rep').innerHTML = html_legrep
                    document.getElementById('score').innerHTML = html_score
                    document.getElementById('party').innerHTML = html_party
                    const legislatorSlug = repIndex.getIn([incumbentId, 'slug']);
                    const ctaHref = `${LEGISLATOR_PAGE_URL_PREFIX}${legislatorSlug}`;
                    document.getElementById('takeActionCTA').setAttribute('href', ctaHref)

                    // store the votes in the hidden div
                    if (html_vote1 === 'undefined') {
                        document.getElementById('vote1Tab').style.color = "black"
                        document.getElementById('vote1Tab').style.textDecoration = "none"
                        document.getElementById('vote1').style.display = "block"
                        document.getElementById('vote1').innerHTML = 'No featured votes available for this legislator.'
                    } else {
                        document.getElementById('vote1Tab').style.color = "black"
                        document.getElementById('vote1Tab').style.textDecoration = "none"
                        document.getElementById('vote1').style.display = "block"
                        document.getElementById('vote1').innerHTML = html_vote1
                    }
                    if (html_vote2 === 'undefined') {
                        document.getElementById('vote2').style.display = "none"
                        document.getElementById('vote2').innerHTML = 'No featured votes available for this legislator.'
                    } else {
                        document.getElementById('vote2').style.display = "none"
                        document.getElementById('vote2').innerHTML = html_vote2
                    }
                    if (html_vote3 === 'undefined') {
                        document.getElementById('vote3').style.display = "none"
                        document.getElementById('vote3').innerHTML = 'No featured votes available for this legislator.'
                    } else {
                        document.getElementById('vote3').style.display = "none"
                        document.getElementById('vote3').innerHTML = html_vote3
                    }
                    if (html_vote4 === 'undefined') {
                        document.getElementById('vote4').style.display = "none"
                        document.getElementById('vote4').innerHTML = 'No featured votes available for this legislator.'
                    } else {
                        document.getElementById('vote4').style.display = "none"
                        document.getElementById('vote4').innerHTML = html_vote4
                    }
                    if (html_vote5 === 'undefined') {
                        document.getElementById('vote5').style.display = "none"
                        document.getElementById('vote5').innerHTML = 'No featured votes available for this legislator.'
                    } else {
                        document.getElementById('vote5').style.display = "none"
                        document.getElementById('vote5').innerHTML = html_vote5
                    }

                    // when the vote item is clicked, make the vote appear
                    document.getElementById('vote1Tab').addEventListener('click', function () {
                        document.getElementById('vote1Tab').style.color = "black"
                        document.getElementById('vote1Tab').style.textDecoration = "none"
                        document.getElementById('vote2Tab').style.color = "#C36C27"
                        document.getElementById('vote2Tab').style.textDecoration = "underline"
                        document.getElementById('vote3Tab').style.color = "#C36C27"
                        document.getElementById('vote3Tab').style.textDecoration = "underline"
                        document.getElementById('vote4Tab').style.color = "#C36C27"
                        document.getElementById('vote4Tab').style.textDecoration = "underline"
                        document.getElementById('vote5Tab').style.color = "#C36C27"
                        document.getElementById('vote5Tab').style.textDecoration = "underline"

                        document.getElementById('vote1').style.display = 'block';
                        document.getElementById('vote2').style.display = 'none';
                        document.getElementById('vote3').style.display = 'none';
                        document.getElementById('vote4').style.display = 'none';
                        document.getElementById('vote5').style.display = 'none';
                    });

                    document.getElementById('vote2Tab').addEventListener('click', function () {
                        document.getElementById('vote2Tab').style.color = "black"
                        document.getElementById('vote2Tab').style.textDecoration = "none"
                        document.getElementById('vote1Tab').style.color = "#C36C27"
                        document.getElementById('vote1Tab').style.textDecoration = "underline"
                        document.getElementById('vote3Tab').style.color = "#C36C27"
                        document.getElementById('vote3Tab').style.textDecoration = "underline"
                        document.getElementById('vote4Tab').style.color = "#C36C27"
                        document.getElementById('vote4Tab').style.textDecoration = "underline"
                        document.getElementById('vote5Tab').style.color = "#C36C27"
                        document.getElementById('vote5Tab').style.textDecoration = "underline"

                        document.getElementById('vote1').style.display = 'none';
                        document.getElementById('vote2').style.display = 'block';
                        document.getElementById('vote3').style.display = 'none';
                        document.getElementById('vote4').style.display = 'none';
                        document.getElementById('vote5').style.display = 'none';
                    });

                    document.getElementById('vote3Tab').addEventListener('click', function () {
                        document.getElementById('vote3Tab').style.color = "black"
                        document.getElementById('vote3Tab').style.textDecoration = "none"
                        document.getElementById('vote1Tab').style.color = "#C36C27"
                        document.getElementById('vote1Tab').style.textDecoration = "underline"
                        document.getElementById('vote2Tab').style.color = "#C36C27"
                        document.getElementById('vote2Tab').style.textDecoration = "underline"
                        document.getElementById('vote4Tab').style.color = "#C36C27"
                        document.getElementById('vote4Tab').style.textDecoration = "underline"
                        document.getElementById('vote5Tab').style.color = "#C36C27"
                        document.getElementById('vote5Tab').style.textDecoration = "underline"

                        document.getElementById('vote1').style.display = 'none';
                        document.getElementById('vote2').style.display = 'none';
                        document.getElementById('vote3').style.display = 'block';
                        document.getElementById('vote4').style.display = 'none';
                        document.getElementById('vote5').style.display = 'none';
                    });

                    document.getElementById('vote4Tab').addEventListener('click', function () {
                        document.getElementById('vote4Tab').style.color = "black"
                        document.getElementById('vote4Tab').style.textDecoration = "none"
                        document.getElementById('vote1Tab').style.color = "#C36C27"
                        document.getElementById('vote1Tab').style.textDecoration = "underline"
                        document.getElementById('vote2Tab').style.color = "#C36C27"
                        document.getElementById('vote2Tab').style.textDecoration = "underline"
                        document.getElementById('vote3Tab').style.color = "#C36C27"
                        document.getElementById('vote3Tab').style.textDecoration = "underline"
                        document.getElementById('vote5Tab').style.color = "#C36C27"
                        document.getElementById('vote5Tab').style.textDecoration = "underline"

                        document.getElementById('vote1').style.display = 'none';
                        document.getElementById('vote2').style.display = 'none';
                        document.getElementById('vote3').style.display = 'none';
                        document.getElementById('vote4').style.display = 'block';
                        document.getElementById('vote5').style.display = 'none';
                    });

                    document.getElementById('vote5Tab').addEventListener('click', function () {
                        document.getElementById('vote5Tab').style.color = "black"
                        document.getElementById('vote5Tab').style.textDecoration = "none"
                        document.getElementById('vote1Tab').style.color = "#C36C27"
                        document.getElementById('vote1Tab').style.textDecoration = "underline"
                        document.getElementById('vote2Tab').style.color = "#C36C27"
                        document.getElementById('vote2Tab').style.textDecoration = "underline"
                        document.getElementById('vote3Tab').style.color = "#C36C27"
                        document.getElementById('vote3Tab').style.textDecoration = "underline"
                        document.getElementById('vote4Tab').style.color = "#C36C27"
                        document.getElementById('vote4Tab').style.textDecoration = "underline"

                        document.getElementById('vote1').style.display = 'none';
                        document.getElementById('vote2').style.display = 'none';
                        document.getElementById('vote3').style.display = 'none';
                        document.getElementById('vote4').style.display = 'none';
                        document.getElementById('vote5').style.display = 'block';
                    });
                })

                } else if (selectedState && selectedChamber === "senate") {
                    let selectedState = document.getElementById('state-select').value
                    let selectedChamber = document.getElementById('chamber-select').value

                    // when the district is selected, zoom in and populate legislator details
                    document.getElementById('district-select').addEventListener('change', function () {
                        // change 'district' color and border to orange
                        document.getElementById('district-select').style.color = "#C36C27"
                        document.getElementById('district-select').style.borderColor = "#C36C27"

                        // hide instructions
                        document.getElementById('instructions').style.display = "none"

                        let selectedDistrict = document.getElementById('district-select').value
                        let bounds = senate_bounds[selectedState][selectedDistrict]
                        // zoom to the district
                        map.fitBounds(bounds)
                        // compute ccid for selected district
                        const ccidCode = statesToCodes[selectedState.toUpperCase()] + zeroPad(selectedDistrict, 3) + chamberToLetter[selectedChamber]
                        // populate the legislator details
                        const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])
                        // make the contents of the legislator details component visible
                        document.getElementById('details').style.visibility = "visible"

                        const html_legname = `${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}`;
                        const html_legrep = `${initialsToState[repIndex.getIn([incumbentId, 'state_abbr']).toLowerCase()]} ${regionsIndex.getIn([ccidCode, 'name'])}`;
                        const html_score = `${Math.round(repIndex.getIn([incumbentId, 'cc_score']))}`;
                        const html_party = `${repIndex.getIn([incumbentId, 'party'])}`;
                        const html_vote1 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 0])}`;
                        const html_vote2 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 1])}`;
                        const html_vote3 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 2])}`;
                        const html_vote4 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 3])}`;
                        const html_vote5 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 4])}`;

                        // store html in the sidebar divs
                        document.getElementById('name').innerHTML = html_legname
                        document.getElementById('rep').innerHTML = html_legrep
                        document.getElementById('score').innerHTML = html_score
                        document.getElementById('party').innerHTML = html_party

                        // store the votes in the hidden div
                        if (html_vote1 === 'undefined') {
                            document.getElementById('vote1Tab').style.color = "black"
                            document.getElementById('vote1Tab').style.textDecoration = "none"
                            document.getElementById('vote1').style.display = "block"
                            document.getElementById('vote1').innerHTML = 'No featured votes available for this legislator.'
                        } else {
                            document.getElementById('vote1Tab').style.color = "black"
                            document.getElementById('vote1Tab').style.textDecoration = "none"
                            document.getElementById('vote1').style.display = "block"
                            document.getElementById('vote1').innerHTML = html_vote1
                        }
                        if (html_vote2 === 'undefined') {
                            document.getElementById('vote2').style.display = "none"
                            document.getElementById('vote2').innerHTML = 'No featured votes available for this legislator.'
                        } else {
                            document.getElementById('vote2').style.display = "none"
                            document.getElementById('vote2').innerHTML = html_vote2
                        }
                        if (html_vote3 === 'undefined') {
                            document.getElementById('vote3').style.display = "none"
                            document.getElementById('vote3').innerHTML = 'No featured votes available for this legislator.'
                        } else {
                            document.getElementById('vote3').style.display = "none"
                            document.getElementById('vote3').innerHTML = html_vote3
                        }
                        if (html_vote4 === 'undefined') {
                            document.getElementById('vote4').style.display = "none"
                            document.getElementById('vote4').innerHTML = 'No featured votes available for this legislator.'
                        } else {
                            document.getElementById('vote4').style.display = "none"
                            document.getElementById('vote4').innerHTML = html_vote4
                        }
                        if (html_vote5 === 'undefined') {
                            document.getElementById('vote5').style.display = "none"
                            document.getElementById('vote5').innerHTML = 'No featured votes available for this legislator.'
                        } else {
                            document.getElementById('vote5').style.display = "none"
                            document.getElementById('vote5').innerHTML = html_vote5
                        }

                        // when the vote item is clicked, make the vote appear
                        document.getElementById('vote1Tab').addEventListener('click', function () {
                            document.getElementById('vote1Tab').style.color = "black"
                            document.getElementById('vote1Tab').style.textDecoration = "none"
                            document.getElementById('vote2Tab').style.color = "#C36C27"
                            document.getElementById('vote2Tab').style.textDecoration = "underline"
                            document.getElementById('vote3Tab').style.color = "#C36C27"
                            document.getElementById('vote3Tab').style.textDecoration = "underline"
                            document.getElementById('vote4Tab').style.color = "#C36C27"
                            document.getElementById('vote4Tab').style.textDecoration = "underline"
                            document.getElementById('vote5Tab').style.color = "#C36C27"
                            document.getElementById('vote5Tab').style.textDecoration = "underline"

                            document.getElementById('vote1').style.display = 'block';
                            document.getElementById('vote2').style.display = 'none';
                            document.getElementById('vote3').style.display = 'none';
                            document.getElementById('vote4').style.display = 'none';
                            document.getElementById('vote5').style.display = 'none';
                        });

                        document.getElementById('vote2Tab').addEventListener('click', function () {
                            document.getElementById('vote2Tab').style.color = "black"
                            document.getElementById('vote2Tab').style.textDecoration = "none"
                            document.getElementById('vote1Tab').style.color = "#C36C27"
                            document.getElementById('vote1Tab').style.textDecoration = "underline"
                            document.getElementById('vote3Tab').style.color = "#C36C27"
                            document.getElementById('vote3Tab').style.textDecoration = "underline"
                            document.getElementById('vote4Tab').style.color = "#C36C27"
                            document.getElementById('vote4Tab').style.textDecoration = "underline"
                            document.getElementById('vote5Tab').style.color = "#C36C27"
                            document.getElementById('vote5Tab').style.textDecoration = "underline"

                            document.getElementById('vote1').style.display = 'none';
                            document.getElementById('vote2').style.display = 'block';
                            document.getElementById('vote3').style.display = 'none';
                            document.getElementById('vote4').style.display = 'none';
                            document.getElementById('vote5').style.display = 'none';
                        });

                        document.getElementById('vote3Tab').addEventListener('click', function () {
                            document.getElementById('vote3Tab').style.color = "black"
                            document.getElementById('vote3Tab').style.textDecoration = "none"
                            document.getElementById('vote1Tab').style.color = "#C36C27"
                            document.getElementById('vote1Tab').style.textDecoration = "underline"
                            document.getElementById('vote2Tab').style.color = "#C36C27"
                            document.getElementById('vote2Tab').style.textDecoration = "underline"
                            document.getElementById('vote4Tab').style.color = "#C36C27"
                            document.getElementById('vote4Tab').style.textDecoration = "underline"
                            document.getElementById('vote5Tab').style.color = "#C36C27"
                            document.getElementById('vote5Tab').style.textDecoration = "underline"

                            document.getElementById('vote1').style.display = 'none';
                            document.getElementById('vote2').style.display = 'none';
                            document.getElementById('vote3').style.display = 'block';
                            document.getElementById('vote4').style.display = 'none';
                            document.getElementById('vote5').style.display = 'none';
                        });

                        document.getElementById('vote4Tab').addEventListener('click', function () {
                            document.getElementById('vote4Tab').style.color = "black"
                            document.getElementById('vote4Tab').style.textDecoration = "none"
                            document.getElementById('vote1Tab').style.color = "#C36C27"
                            document.getElementById('vote1Tab').style.textDecoration = "underline"
                            document.getElementById('vote2Tab').style.color = "#C36C27"
                            document.getElementById('vote2Tab').style.textDecoration = "underline"
                            document.getElementById('vote3Tab').style.color = "#C36C27"
                            document.getElementById('vote3Tab').style.textDecoration = "underline"
                            document.getElementById('vote5Tab').style.color = "#C36C27"
                            document.getElementById('vote5Tab').style.textDecoration = "underline"

                            document.getElementById('vote1').style.display = 'none';
                            document.getElementById('vote2').style.display = 'none';
                            document.getElementById('vote3').style.display = 'none';
                            document.getElementById('vote4').style.display = 'block';
                            document.getElementById('vote5').style.display = 'none';
                        });

                        document.getElementById('vote5Tab').addEventListener('click', function () {
                            document.getElementById('vote5Tab').style.color = "black"
                            document.getElementById('vote5Tab').style.textDecoration = "none"
                            document.getElementById('vote1Tab').style.color = "#C36C27"
                            document.getElementById('vote1Tab').style.textDecoration = "underline"
                            document.getElementById('vote2Tab').style.color = "#C36C27"
                            document.getElementById('vote2Tab').style.textDecoration = "underline"
                            document.getElementById('vote3Tab').style.color = "#C36C27"
                            document.getElementById('vote3Tab').style.textDecoration = "underline"
                            document.getElementById('vote4Tab').style.color = "#C36C27"
                            document.getElementById('vote4Tab').style.textDecoration = "underline"

                            document.getElementById('vote1').style.display = 'none';
                            document.getElementById('vote2').style.display = 'none';
                            document.getElementById('vote3').style.display = 'none';
                            document.getElementById('vote4').style.display = 'none';
                            document.getElementById('vote5').style.display = 'block';
                        });
                    })
                }

            } else {
                console.log('no chamber selected yet')
            }

            // reset the navigation options, and hide components, when the reset button is clicked
            document.getElementById('reset').addEventListener('click', function () {
                document.getElementById('state-select').disabled = false
                document.getElementById('chamber-select').disabled = true
                document.getElementById('district-select').disabled = true

                // change instructions text
                document.getElementById('instructions').style.display = "block"
                document.getElementById('instructions').innerHTML = "Please Select A State"

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

                // hide legislator components
                document.getElementById('details').style.visibility = "hidden"
                document.getElementById('name').innerHTML = ""
                document.getElementById('party').innerHTML = ""
                document.getElementById('score').innerHTML = ""
                document.getElementById('rep').innerHTML = ""
                document.getElementById('vote1').innerHTML = ""
                document.getElementById('vote2').innerHTML = ""
                document.getElementById('vote3').innerHTML = ""
                document.getElementById('vote4').innerHTML = ""
                document.getElementById('vote5').innerHTML = ""

                // change back to senate layer
                map.setLayoutProperty('state-fill', 'visibility', 'none')
                map.setLayoutProperty('senate-fill', 'visibility', 'visible')
                map.setLayoutProperty('house-fill', 'visibility', 'none')
                // zoom out to center
                map.flyTo({center: [-1.14, -0.98], zoom: 3.5})

                // Hide the reset button
                document.getElementById('reset').classList.add('hidden');

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
            console.log(features[0].properties)
            const incumbentId = regionsIndex.getIn([ccidCode, 'incumbents', 0, 'rep'])

            // if the selected feature has a cc_score of 999, make the contents invisible
            if (features[0].properties.cc_score == 999) {
                // keep details div invisible
                document.getElementById('details').style.visibility = "hidden"
            } else {
                // make details div visible
                document.getElementById('details').style.visibility = "visible"
            }

            // make the contents of the legislator details component visible
            // document.getElementById('details').style.visibility = "visible"

            // use the ccidCode to lookup the regions data (stored in the regionsIndex variable) and the representatives data (stored in the repIndex variable)
            // the lookup will find the data associated to the district
            // and relay the following information, stored the in the html variable
            // to be displayed in a tooltip

            const html_legname = `${repIndex.getIn([incumbentId, 'role'])} ${repIndex.getIn([incumbentId, 'full_name'])}`;
            const html_legrep = `${initialsToState[repIndex.getIn([incumbentId, 'state_abbr']).toLowerCase()]} ${regionsIndex.getIn([ccidCode, 'name'])}`;
            const html_score = `${Math.round(repIndex.getIn([incumbentId, 'cc_score']))}`;
            const html_party = `${repIndex.getIn([incumbentId, 'party'])}`;
            const html_vote1 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 0])}`;
            const html_vote2 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 1])}`;
            const html_vote3 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 2])}`;
            const html_vote4 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 3])}`;
            const html_vote5 = `${repIndex.getIn([incumbentId, 'ccscorecard', 'votes', 4])}`;

            // hide instructions text
            document.getElementById('instructions').style.display = "none"


            // store html in the sidebar divs
            document.getElementById('name').innerHTML = html_legname
            document.getElementById('rep').innerHTML = html_legrep
            document.getElementById('score').innerHTML = html_score
            document.getElementById('party').innerHTML = html_party

            // store the votes in the hidden div
            if (html_vote1 === 'undefined') {
                document.getElementById('vote1Tab').style.color = "black"
                document.getElementById('vote1Tab').style.textDecoration = "none"
                document.getElementById('vote1').style.display = "block"
                document.getElementById('vote1').innerHTML = 'No featured votes available for this legislator.'
            } else {
                document.getElementById('vote1Tab').style.color = "black"
                document.getElementById('vote1Tab').style.textDecoration = "none"
                document.getElementById('vote1').style.display = "block"
                document.getElementById('vote1').innerHTML = html_vote1
            }
            if (html_vote2 === 'undefined') {
                document.getElementById('vote2').style.display = "none"
                document.getElementById('vote2').innerHTML = 'No featured votes available for this legislator.'
            } else {
                document.getElementById('vote2').style.display = "none"
                document.getElementById('vote2').innerHTML = html_vote2
            }
            if (html_vote3 === 'undefined') {
                document.getElementById('vote3').style.display = "none"
                document.getElementById('vote3').innerHTML = 'No featured votes available for this legislator.'
            } else {
                document.getElementById('vote3').style.display = "none"
                document.getElementById('vote3').innerHTML = html_vote3
            }
            if (html_vote4 === 'undefined') {
                document.getElementById('vote4').style.display = "none"
                document.getElementById('vote4').innerHTML = 'No featured votes available for this legislator.'
            } else {
                document.getElementById('vote4').style.display = "none"
                document.getElementById('vote4').innerHTML = html_vote4
            }
            if (html_vote5 === 'undefined') {
                document.getElementById('vote5').style.display = "none"
                document.getElementById('vote5').innerHTML = 'No featured votes available for this legislator.'
            } else {
                document.getElementById('vote5').style.display = "none"
                document.getElementById('vote5').innerHTML = html_vote5
            }

            // when the vote item is clicked, make the vote appear
            document.getElementById('vote1Tab').addEventListener('click', function () {
                document.getElementById('vote1Tab').style.color = "black"
                document.getElementById('vote1Tab').style.textDecoration = "none"
                document.getElementById('vote2Tab').style.color = "#C36C27"
                document.getElementById('vote2Tab').style.textDecoration = "underline"
                document.getElementById('vote3Tab').style.color = "#C36C27"
                document.getElementById('vote3Tab').style.textDecoration = "underline"
                document.getElementById('vote4Tab').style.color = "#C36C27"
                document.getElementById('vote4Tab').style.textDecoration = "underline"
                document.getElementById('vote5Tab').style.color = "#C36C27"
                document.getElementById('vote5Tab').style.textDecoration = "underline"

                document.getElementById('vote1').style.display = 'block';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'none';
                document.getElementById('vote5').style.display = 'none';
            });

            document.getElementById('vote2Tab').addEventListener('click', function () {
                document.getElementById('vote2Tab').style.color = "black"
                document.getElementById('vote2Tab').style.textDecoration = "none"
                document.getElementById('vote1Tab').style.color = "#C36C27"
                document.getElementById('vote1Tab').style.textDecoration = "underline"
                document.getElementById('vote3Tab').style.color = "#C36C27"
                document.getElementById('vote3Tab').style.textDecoration = "underline"
                document.getElementById('vote4Tab').style.color = "#C36C27"
                document.getElementById('vote4Tab').style.textDecoration = "underline"
                document.getElementById('vote5Tab').style.color = "#C36C27"
                document.getElementById('vote5Tab').style.textDecoration = "underline"

                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'block';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'none';
                document.getElementById('vote5').style.display = 'none';
            });

            document.getElementById('vote3Tab').addEventListener('click', function () {
                document.getElementById('vote3Tab').style.color = "black"
                document.getElementById('vote3Tab').style.textDecoration = "none"
                document.getElementById('vote1Tab').style.color = "#C36C27"
                document.getElementById('vote1Tab').style.textDecoration = "underline"
                document.getElementById('vote2Tab').style.color = "#C36C27"
                document.getElementById('vote2Tab').style.textDecoration = "underline"
                document.getElementById('vote4Tab').style.color = "#C36C27"
                document.getElementById('vote4Tab').style.textDecoration = "underline"
                document.getElementById('vote5Tab').style.color = "#C36C27"
                document.getElementById('vote5Tab').style.textDecoration = "underline"

                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'block';
                document.getElementById('vote4').style.display = 'none';
                document.getElementById('vote5').style.display = 'none';
            });

            document.getElementById('vote4Tab').addEventListener('click', function () {
                document.getElementById('vote4Tab').style.color = "black"
                document.getElementById('vote4Tab').style.textDecoration = "none"
                document.getElementById('vote1Tab').style.color = "#C36C27"
                document.getElementById('vote1Tab').style.textDecoration = "underline"
                document.getElementById('vote2Tab').style.color = "#C36C27"
                document.getElementById('vote2Tab').style.textDecoration = "underline"
                document.getElementById('vote3Tab').style.color = "#C36C27"
                document.getElementById('vote3Tab').style.textDecoration = "underline"
                document.getElementById('vote5Tab').style.color = "#C36C27"
                document.getElementById('vote5Tab').style.textDecoration = "underline"

                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'block';
                document.getElementById('vote5').style.display = 'none';
            });

            document.getElementById('vote5Tab').addEventListener('click', function () {
                document.getElementById('vote5Tab').style.color = "black"
                document.getElementById('vote5Tab').style.textDecoration = "none"
                document.getElementById('vote1Tab').style.color = "#C36C27"
                document.getElementById('vote1Tab').style.textDecoration = "underline"
                document.getElementById('vote2Tab').style.color = "#C36C27"
                document.getElementById('vote2Tab').style.textDecoration = "underline"
                document.getElementById('vote3Tab').style.color = "#C36C27"
                document.getElementById('vote3Tab').style.textDecoration = "underline"
                document.getElementById('vote4Tab').style.color = "#C36C27"
                document.getElementById('vote4Tab').style.textDecoration = "underline"

                document.getElementById('vote1').style.display = 'none';
                document.getElementById('vote2').style.display = 'none';
                document.getElementById('vote3').style.display = 'none';
                document.getElementById('vote4').style.display = 'none';
                document.getElementById('vote5').style.display = 'block';
            });

        });

    }, [regionsIndex, repIndex])

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
                    <SelectState id="state-select"><option value="" hidden>State</option></SelectState>
                    <SelectChamber id="chamber-select"><option value="" hidden>Chamber</option></SelectChamber>
                    <SelectDistrict id="district-select"><option value="" hidden>District</option></SelectDistrict>
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
            <div className="aside" id="aside">
                <div className="candidateText">LEGISLATOR DETAILS</div>
                <div className="instructions" id="instructions">Please Select A State</div>
                <div id='details' className='details'>
                    <br/>
                    <Name id='name' style={{marginLeft: '15px'}}></Name>
                    <div id='rep' className='repText'></div>
                    <Flex>
                        <div className="scoreBox">
                            <div className="scoreTitle">Climate Score</div>
                            <div className="scoreText" id='score'></div>
                        </div>
                        <div className="scoreBox">
                            <div className="partyTitle">Party</div>
                            <div className="partyText" id='party'></div>
                        </div>
                    </Flex>
                    <VotesBox>
                        <div className="votesText">Selected Climate Votes</div>
                        <div className="voteTabs">
                            <div id='vote5Tab' className="vote5Tab">Vote 5</div>
                            <div id='vote4Tab' className="vote4Tab">Vote 4</div>
                            <div id='vote3Tab' className="vote3Tab">Vote 3</div>
                            <div id='vote2Tab' className="vote2Tab">Vote 2</div>
                            <div id='vote1Tab' className="vote1Tab">Vote 1</div>
                        </div>
                        <br/>
                        <br/>
                        <div id="vote1" className="vote1"></div>
                        <div id="vote2" className="vote2"></div>
                        <div id="vote3" className="vote3"></div>
                        <div id="vote4" className="vote4"></div>
                        <div id="vote5" className="vote5"></div>
                    </VotesBox>
                        <a id="takeActionCTA" href="https://www.climatecabinetaction.org" target="_blank" rel="noreferrer">
                            <div className="actionButton">
                                    Take Action
                            </div>
                        </a>
                </div>
            </div>
        </div>
    )

}



export default Map