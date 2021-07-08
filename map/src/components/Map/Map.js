import React, { useEffect, useRef, useState } from 'react'
import { Flex, Box, Text } from '@rebass/grid'
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
import "typeface-lato";

const Wrapper = styled.div`
    height: 100%;
    font-family: 'Lato', sans-serif;
`

// map header component
const MapHeader = styled(Box)`
  color: black;
  font-size: 24px;
  font-weight: 700;
  padding-bottom: 10px;
`

const Select = styled.select`
    width: 20vw;
    height: 35px;
    background: white;
    color: #333;
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    border: 1px solid #C36C27;
`

// details component
const DetailsBox = styled(Box)`
  width: 100%;
  height: 90%;
  opacity: 95%;
  margin: auto;
  justify-content: space-evenly;
`
// background-color: #F3F3F3;

// details text component
const Details = styled(Box)`
  color: #000;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 10px;
  margin-left: 15px;
  margin-top: 15px;
`

// name component
const Name = styled(Box)`
  color: #C36C27;
  font-size: 26px;
  font-weight: 700;
  padding-top: 15px;
  padding-bottom: 10px;
  margin-left: 15px;
`

// party component
const Party = styled(Box)`
  color: #000000;
  font-size: 20px;
  font-weight: 700;
  padding-bottom: 15px;
  margin-left: 15px;
`

// CC score & presidential results component
const ScoreBox = styled(Box)`
  background-color: white;
  width: 50vw;
  height: 15vh;
  margin-left: 15px;
  margin-right: 15px;
  padding-top: 5px;
  padding-bottom: 15px;
`

// styled text in the ^ components
const Numbers = styled(Box)`
  font-size: 24px;
  color: #C36C27;
  text-align: center;
`

// styled text for the CC score and presidential results
const ScoreText = styled(Box)`
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    font-size: 12px;
    padding-bottom: 15px;
`

// past votes box component
const VotesBox = styled(Box)`
    margin-left: 15px;
    margin-top: 15px;
    font-weight: 700;
    font-size: 16px;
    color: #C36C27;
`

// take action box component
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
                layers: ['upperFL-fill', 'upperGA-fill']
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

        // change cursor to pointer when hovering over a district
        // map.on('mouseenter', function(mapElement) {
        //     // when you hover over a point on the map, query the features under the point and store
        //     // in the variable 'features'
        //     const features = map.queryRenderedFeatures(mapElement.point, {
        //         layers: ['upperFL-fill', 'upperGA-fill']
        //         // layers: ['upperFL-fill', 'upperGA-fill', 'upperAL-fill', 'upperMS-fill', 'upperLA-fill', 'upperAR-fill',
        //         // 'upperTN-fill', 'upperKY-fill', 'upperWV-fill', 'upperVA-fill', 'upperNC-fill', 'upperSC-fill']
        //     })
        //     // if there's something under the point (the features variable is not null)
        //     // then change the style of the cursor to pointer
        //     // to signal that you can click here
        //     if (features.length) {
        //         map.getCanvas().style.cursor = 'pointer';
        //     }
        // });

        // change the cursor back to the "grabbing" mouse when you're not hovering over a clickable feature -- which is just a district
        // map.on('mouseleave', function () {
        //     map.getCanvas().style.cursor = '';
        // });

        // hovering
        let hoveredDistrictId = null;

        map.on('mousemove', 'upperFL-fill', (e) => {
            map.getCanvas().style.cursor = 'pointer';
            if (e.features.length > 0) {
                if (hoveredDistrictId) {
                    // set the hover attribute to false with feature state
                    map.setFeatureState({
                        source: 'upperFL',
                        id: hoveredDistrictId
                    }, {
                        hover: false
                    });
                }

                hoveredDistrictId = e.features[0].id
                // set the hover attribute to true with feature state
                map.setFeatureState({
                    source: 'upperFL',
                    id: hoveredDistrictId
                }, {
                    hover: true
                });
            }
        });

        // clean up on unmount
        return () => map.remove();
    
    }, [])

    return (
    <Wrapper>
       <Flex flexWrap='wrap' mx={2} py={4}>
            <Box
                px={2}
                py={0}
                width={2/3}
                color='white'
                height='90vh'>
                <Box color='black' height='15vh'> 
                    <MapHeader>Interactive Map</MapHeader>
                    <Select>
                        <option value="" hidden>State</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                    </Select>
                    <Select style={{marginLeft: '20px'}}>
                        <option value="" hidden>Chamber</option>
                        <option value="Upper">Senate</option>
                        <option value="Lower">House</option>
                    </Select> 
                    <Select style={{marginLeft: '20px'}}>
                        <option value="" hidden>District</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </Select> 
                </Box>
                <Box height='calc(70% + 2rem)' ref={mapContainer} />
            </Box>
            <Box
                px={2}
                py={2}
                width={1/3}
                height='82vh'
                color='black'
                bg='#F3F3F3'
                opacity='0.95'
                fontFamily='Lato'>
                <DetailsBox>
                    <Details>Candidate Details</Details>
                    <Name><div id='name'></div></Name>
                    <Party><div id='party'></div></Party>
                    <Flex>
                    <ScoreBox>
                        <ScoreText>Climate Cabinet Score</ScoreText>
                        <Numbers><div id='score'></div></Numbers>
                    </ScoreBox>
                    <ScoreBox>
                        <ScoreText>Last Presidential Result</ScoreText>
                        <Numbers><div id='result'></div></Numbers>
                    </ScoreBox>
                    </Flex>
                    <VotesBox>Past Climate Votes</VotesBox>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <ActionBox>Take Action</ActionBox>
                </DetailsBox>
            </Box>
        </Flex>
    </Wrapper>
    )

}

// style={{ width: '100%', height: '100%' }}

export default Map