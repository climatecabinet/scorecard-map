import { Box, Flex } from '@rebass/grid';
import React from 'react';
import styled from '../../../util/style';

// name element
const Name = styled(Box)`
  color: #C36C27;
  font-size: 26px;
  font-weight: 700;
  padding-top: 15px;
  padding-bottom: 10px;
`;

// votes box
const VotesBox = styled(Box)`
    margin-left: 15px;
    margin-top: 50px;
    margin-right: 15px;
`;

const LegislatorDetails = () => (
  <div className="aside" id="aside">
    <div className="candidateText">LEGISLATOR DETAILS</div>
    <div className="instructions" id="instructions">
      Please Select A State
    </div>
    <div id="details" className="details">
      <br />
      <Name id="name" style={{ marginLeft: '15px' }}></Name>
      <div id="rep" className="repText"></div>
      <Flex>
        <div className="scoreBox">
          <div className="scoreTitle">Climate Score</div>
          <div className="scoreText" id="score"></div>
        </div>
        <div className="scoreBox">
          <div className="partyTitle">Party</div>
          <div className="partyText" id="party"></div>
        </div>
      </Flex>
      <VotesBox>
        <div className="votesText">Selected Climate Votes</div>
        <div className="voteTabs">
          <div id="vote5Tab" className="vote5Tab">
            Vote 5
          </div>
          <div id="vote4Tab" className="vote4Tab">
            Vote 4
          </div>
          <div id="vote3Tab" className="vote3Tab">
            Vote 3
          </div>
          <div id="vote2Tab" className="vote2Tab">
            Vote 2
          </div>
          <div id="vote1Tab" className="vote1Tab">
            Vote 1
          </div>
        </div>
        <br />
        <br />
        <div id="vote1" className="vote1"></div>
        <div id="vote2" className="vote2"></div>
        <div id="vote3" className="vote3"></div>
        <div id="vote4" className="vote4"></div>
        <div id="vote5" className="vote5"></div>
      </VotesBox>
      <a
        id="takeActionCTA"
        href="https://www.climatecabinetaction.org"
        target="_blank"
        rel="noreferrer"
      >
        <div className="actionButton">Take Action</div>
      </a>
    </div>
  </div>
);

export default LegislatorDetails;
