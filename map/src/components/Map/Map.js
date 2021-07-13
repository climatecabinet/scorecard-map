import React, { useEffect, useRef, useState } from 'react'
import { Flex, Box } from '@rebass/grid'
import mapboxgl from 'mapbox-gl'
import { siteMetadata } from '../../../gatsby-config'
import { useData } from '../Data/regions'
import { useRepData } from '../Data/representatives'
import { sources, layers, senate_bounds, house_bounds, initialsToState} from '../../../config/map'
import styled from '../../../util/style'
import "typeface-lato";

// wrapper for the map component
const Wrapper = styled.div`
    height: 100%;
    font-family: 'Lato', sans-serif;
`

// map container component
// desktop view: 100%vh of the screen
// mobile & iPad view: 50%vh of the screen
const MapContainer = styled(Box)`
    position: absolute!important;
    top: 0!important;
    left: 0!important;
    bottom: 0!important;
    right: 0!important;
    width: 100%;
    @media screen and (min-width: 800px) {
        height: 100vh!important
    };
    @media screen and (max-width: 425px) {
        height: 50vh!important
    }
`

// navigation bar component
// desktop view: above the map
// mobile & iPad view: underneath the map, 50% of the view
const Navbar = styled.div`
    background-color: #F3F3F3;
    height: 50vh!important;
    position: absolute!important;
    bottom: 0!important;
    right: 0!important;
    width: 100%!important;
    background-color: #fff;
    padding: 2px;
    color: #29323c;
    box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 1px 1px rgba(16, 22, 26, 0.2), 0 2px 6px rgba(16, 22, 26, 0.2);
    @media screen and (min-width: 800px) {
        top: 0!important;
        width: 300px!important;
        height: 100px!important;
    }
`

// select elements
const Select = styled.select`
    width: 30vw;
    height: 35px;
    background: white;
    color: #333;
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    border: 1px solid #C36C27;
`

// enter box
const EnterBox = styled.div`
    position: absolute;
    width: 90vw;
    background-color: #C36C27;
    color: white;
    text-align: center;
    font-size: 20px;
    text-transform: uppercase;
    padding: 5px 5px 5px 10px;
    margin-top: 10px;
`

// sidebar component
const Sidebar = styled.div`
    width: 100%;
    height: 90%;
    opacity: 95%;
    margin-top: 70px;
    justify-content: space-evenly;
`


// candidate details box
const Details = styled(Box)`
  color: #000;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 10px;
  margin-left: 15px;
  margin-top: 15px;
`

// name element
const Name = styled(Box)`
  color: #C36C27;
  font-size: 26px;
  font-weight: 700;
  padding-top: 15px;
  padding-bottom: 10px;
  margin-left: 15px;
`

// party element
const Party = styled(Box)`
  color: #000000;
  font-size: 20px;
  font-weight: 700;
  padding-bottom: 15px;
  margin-left: 15px;
`

// score box
const ScoreBox = styled(Box)`
  background-color: white;
  width: 50vw;
  height: 15vh;
  margin-left: 15px;
  margin-right: 15px;
  padding-top: 5px;
  padding-bottom: 15px;
`

// score text element
const ScoreText = styled(Box)`
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    font-size: 12px;
    padding-bottom: 15px;
`

// numbers element
const Numbers = styled(Box)`
  font-size: 24px;
  color: #C36C27;
  text-align: center;
`

// votes box
const VotesBox = styled(Box)`
    margin-left: 15px;
    margin-top: 15px;
    font-weight: 700;
    font-size: 16px;
    color: #C36C27;
`

// action box
const ActionBox = styled(Box)`
    width: 15vw;
    margin-left: 15px;
    margin-bottom: 15px;
    background-color: #C36C27;
    color: white;
    text-align: center;
    font-size: 20px;
    text-transform: uppercase;
    padding: 10px 10px 10px 10px;
`

// store mapbox token
const mapboxToken = siteMetadata.mapboxToken

// map component
const Map = () => {

    // function to quantify zoom level, based on area
    function getZoom(area) {
        if (area <= 0.01) {
            return 13;
        } else if (area <= 0.05) {
            return 12;
        } else if (area <= 0.1) {
            return 11;
        } else if (area <= 0.5) {
            return 10;
        } else if (area <= 0.9) {
            return 9;
        } else {
            return 8;
        }
    }

    // function to show options for chamber after a state is selected
    let updateChamberSelect = function () {
        let currentState = document.getElementById('state-select').value;

        if (currentState) {
            // create a list of chambers 
            let chambers = Object.keys(sources)

            // update the chamber div element with the map sources
            const selectChamber = document.getElementById('chamber-select')
            for (let i = 0; i < chambers.length; i++) {
                let currentChamber = chambers[i]
                let newOption = new Option(currentChamber)
                selectChamber.add(newOption, undefined)
            }
        } else {
            document.getElementById('chamber-select').value = 'Select a State'
        }
    }

    // function to update the district values when a state is selected
    let updateDistrictSelect = function () {
        let coord_dict;
        let currentState = document.getElementById('state-select').value;
        let currentChamber = document.getElementById('chamber-select').value;

        if (currentState) {
            if (currentChamber === 'upperFL') {
                // if the selected chamber is upperFL (or senate), then grab the senate coordinates for the selected state
                coord_dict = senate_bounds[currentState]
            } else {
                // if the selected chamber is lowerFL (or house), then grab the house coordinates for the selected state
                coord_dict = house_bounds[currentState]
            }
        

        let districts = Object.keys(coord_dict)
        districts = districts.map(Number);
        districts.sort(function (a, b) {
            return a - b;
        });

        // store the current, selected district
        var selectElement = document.getElementById('district-select');

        // Ggt the old options and remove them
        var selectOptions = selectElement.options;
        while (selectOptions.length > 0) {
            selectElement.remove(0);
        }

        // Add new options
        for (let i = 0; i < districts.length; i++) {
            let currentDistrict = districts[i];
            let newOption = new Option(currentDistrict, currentDistrict);
            selectElement.add(newOption, undefined);
        }
    }
    }

    // if there's no mapbox token, raise an error in the console
    if (!mapboxToken) {
        console.error(
            'ERROR: Mapbox token is required in gatsby-config.js siteMetadata'
        )
    }

    // this ref holds the map DOM node so that we can pass it into Mapbox GL
    const mapContainer = useRef(null)

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
            let states = Object.keys(senate_bounds)
            states.sort();

            // update the select div element by converting the state abbrevations to the full state names
            const selectElement = document.getElementById('state-select')
            for (let i = 0; i < states.length; i++) {
                let currentState = states[i]; 
                let newOption = new Option(initialsToState[currentState], currentState); 
                selectElement.add(newOption, undefined); 
            }

            // populate the chamber element based on the selected state
            updateChamberSelect();

            // populate the district element based on the selected state
            updateDistrictSelect();

            // map.resize();
        });

        map.on('click', function(mapElement) {
            // when you click a point on the map, query the features under the point and store
            // in the variable 'features'
            const features = map.queryRenderedFeatures(mapElement.point, {
                layers: ['upperFL-fill', 'lowerFL-fill']
                // layers: ['upperFL-fill', 'upperGA-fill', 'upperAL-fill', 'upperMS-fill', 'upperLA-fill', 'upperAR-fill',
                // 'upperTN-fill', 'upperKY-fill', 'upperWV-fill', 'upperVA-fill', 'upperNC-fill', 'upperSC-fill']
            })

            // also on click, get the ccid and the regions.incumbent.rep id
            // for the point that represents the clicked district
            const ccidCode = features[0].properties.ccid
            console.log(features[0])
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
            const html_results = `NA`;

            // ${billIndex.getIn([billCode.toString(), 'description'])}
            // ${regionsIndex.getIn([ccidCode, 'state_abbr'])}, Senate, ${parseInt(regionsIndex.getIn([ccidCode, 'district_no']), 10)}
            
            // store html in the sidebar divs
            document.getElementById('name').innerHTML = html_legname
            document.getElementById('party').innerHTML = html_legparty
            document.getElementById('score').innerHTML = html_score
            document.getElementById('result').innerHTML = html_results

        });

        // after pressing the enter button, zoom to the state/chamber/district
        document.getElementById('enter-button').addEventListener('click', function () {
            let coord_dict;
            let currentState = document.getElementById('state-select').value;
            let currentDistrict = document.getElementById('district-select').value;

            if (document.getElementById('chamber-select').value === 'upperFL') {
                // if the selected chamber is upperFL (or senate), then grab the senate coordinates for the selected state
                coord_dict = senate_bounds[currentState]
            } else {
                // if the selected chamber is lowerFL (or house), then grab the house coordinates for the selected state
                coord_dict = house_bounds[currentState]
            }

            let area = coord_dict[currentDistrict][2]
            let zoomLevel = getZoom(area)

            // fly to the point
            map.flyTo({
                center: coord_dict[currentDistrict],
                zoom: zoomLevel,
                essential: true
            })


        })

        // // clean up on unmount
        // return () => {
        //     map.remove()
        // };
    
    }, [])


    return (
        <Wrapper>
            <Box>
                {/* contains map and navigation bar */}
                <MapContainer ref={mapContainer}></MapContainer>
                <Navbar>
                    <Select id="state-select" style={{marginLeft: '10px'}}><option value="" hidden>Select a State</option></Select>
                    <Select id="chamber-select" style={{marginLeft: '10px'}}><option value="" hidden>Select a Chamber</option></Select>
                    <Select id="district-select" style={{marginLeft: '10px'}}><option value="" hidden>Select a District</option></Select>
                    <EnterBox id="enter-button" style={{marginLeft: '10px'}}>Enter</EnterBox>
                {/* contains sidebar */}
                <Sidebar>
                    <Details>Candidate Details</Details>
                    <Name id='name'></Name>
                    <Party id='party'></Party>
                    <Flex>
                    <ScoreBox>
                        <ScoreText>Climate Cabinet Score</ScoreText>
                        <Numbers id='score'></Numbers>
                    </ScoreBox>
                    <ScoreBox>
                        <ScoreText>Last Presidential Result</ScoreText>
                        <Numbers id='result'></Numbers>
                    </ScoreBox>
                    </Flex>
                    <VotesBox>Past Climate Votes</VotesBox>
                    {/* <ActionBox>Take Action</ActionBox> */}
                </Sidebar>
                </Navbar>
            </Box>
        </Wrapper>
    )

}

export default Map