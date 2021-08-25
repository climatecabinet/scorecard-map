import { Box, Flex } from '@rebass/grid';
import React from 'react';
import styled from '../../../util/style';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { initialsToState } from '../../../config/map';

const NO_VOTE_FALLBACK_TEXT = 'No featured votes available for this legislator.';
const LEGISLATOR_PAGE_URL_PREFIX = 'https://www.climatecabinetaction.org/legislator-pages/';

const GET_REP_DETAILS = gql`
  query representativeById($representativeId: ObjectId!) {
    representative(query: { _id: $representativeId }) {
      role
      full_name
      state_abbr
      cc_score
      party
      slug
      ccscorecard {
        votes
      }
    }
  }
`;

// name element
const Name = styled(Box)`
  color: #c36c27;
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

const Details = styled(Box)`
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};
`;

const VoteTab = ({ tabNumber, isActive, onClick }) => {
  const className = isActive ? 'voteTab' : 'voteTab voteTabInactive';
  return (
    <div className={className} onClick={onClick}>
      Vote {tabNumber}
    </div>
  );
};

// TODO(mike): Pass instructions in as a stage here.
const LegislatorDetails = ({ representativeId, regionName, instructions }) => {
  const [selectedVoteNumber, setSelectedVoteNumber] = useState(1);
  const { loading, error, data } = useQuery(GET_REP_DETAILS, {
    variables: { representativeId },
    skip: !representativeId,
  });

  if (loading) {
    return <p>loading!</p>;
  }

  const rep = representativeId && data?.representative;

  // TODO(mike): Maybe return an empty div with some height instead of all the optional chaining.
  return (
    <div className="aside" id="aside">
      <div className="candidateText">LEGISLATOR DETAILS</div>
      {instructions && (
        <div className="instructions" id="instructions">
          {instructions}
        </div>
      )}
      {rep && (
        <div>
          <br />
          <Name id="name" style={{ marginLeft: '15px' }}>{`${rep.role} ${rep.full_name}`}</Name>
          <div id="rep" className="repText">{`${
            initialsToState[rep.state_abbr.toLowerCase()]
          } ${regionName}`}</div>
          <Flex>
            <div className="scoreBox">
              <div className="scoreTitle">Climate Score</div>
              <div className="scoreText" id="score">{`${Math.round(rep.cc_score)}`}</div>
            </div>
            <div className="scoreBox">
              <div className="partyTitle">Party</div>
              <div className="partyText" id="party">{`${rep.party}`}</div>
            </div>
          </Flex>
          <VotesBox>
            <div className="voteTitleAndTabs">
              <div className="votesText">Selected Climate Votes</div>
              <div className="voteTabs">
                {[1, 2, 3, 4, 5].map((tabNumber) => (
                  <VoteTab
                    key={tabNumber}
                    tabNumber={tabNumber}
                    isActive={tabNumber === selectedVoteNumber}
                    onClick={() => setSelectedVoteNumber(tabNumber)}
                  />
                ))}
              </div>
            </div>
            <div className="vote">
              {(rep.ccscorecard.votes && rep.ccscorecard.votes[selectedVoteNumber - 1]) ||
                NO_VOTE_FALLBACK_TEXT}
            </div>
          </VotesBox>
          <a
            id="takeActionCTA"
            href={`${LEGISLATOR_PAGE_URL_PREFIX}${rep.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="actionButton">Take Action</div>
          </a>
        </div>
      )}
    </div>
  );
};

export default LegislatorDetails;
