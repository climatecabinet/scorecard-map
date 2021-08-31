import { Box, Flex } from '@rebass/grid';
import React from 'react';
import styled from '../../../util/style';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { initialsToState } from '../../../config/map';
import Loading from './Loading';
import PropTypes from 'prop-types';

// if there are no votes, use this text
const NO_VOTES_FALLBACK_TEXT = 'No featured votes available for this legislator.';

// slug prefix
const LEGISLATOR_PAGE_URL_PREFIX = 'https://www.climatecabinetaction.org/legislator-pages/';

// graphql query for legislator details
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

// vote tab component
const VoteTab = ({ tabNumber, isActive, onClick }) => {
  const className = isActive ? 'voteTab' : 'voteTab voteTabInactive';
  return (
    <div className={className} onClick={onClick}>
      Vote {tabNumber}
    </div>
  );
};

// legislator details component
const LegislatorDetails = ({ representativeId, regionName }) => {

  const [selectedVoteNumber, setSelectedVoteNumber] = useState(1);
  const { loading, error, data } = useQuery(GET_REP_DETAILS, {
    variables: { representativeId },
  });

  // if the component is loading, return a loading indicator
  if (loading) {
    return (
      <Flex flexDirection="column" alignItems="center" mt="15px">
        <Loading width="60%" />
      </Flex>
    );
  }

  const rep = data.representative;
  const { votes } = rep.ccscorecard;
  const hasVotes = votes.length > 0;

  return (
    <div>
      <br />
      <Name id="name" style={{ marginLeft: '15px' }}>{`${rep.role} ${rep.full_name}`}</Name>
          <div id="rep" className="repText">{`${
            initialsToState[rep.state_abbr.toLowerCase()]
          } ${regionName}`}</div>
      <Flex>
        <div className="scoreBox-climate">
          <div className="scoreTitle">Climate Score</div>
          <div className="scoreText" id="score">{`${Math.round(rep.cc_score)}`}</div>
        </div>
        <div className="scoreBox-party">
          <div className="partyTitle">Party</div>
          <div className="partyText" id="party">{`${rep.party}`}</div>
        </div>
      </Flex>
      <VotesBox>
        {hasVotes && (
          <div className="voteTitleAndTabs">
            <div className="votesText">Selected Climate Votes</div>
            <div className="voteTabs">
              {votes.map((_vote, index) => {
                const tabNumber = index + 1;
                return (
                  <VoteTab
                    key={tabNumber}
                    tabNumber={tabNumber}
                    isActive={tabNumber === selectedVoteNumber}
                    onClick={() => setSelectedVoteNumber(tabNumber)}
                  />
                );
              })}
            </div>
          </div>
        )}
        <div className="vote">
          {hasVotes ? rep.ccscorecard.votes[selectedVoteNumber - 1] : NO_VOTES_FALLBACK_TEXT}
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
  );
};

LegislatorDetails.propTypes = {
  representativeId: PropTypes.string.isRequired,
  regionName: PropTypes.string.isRequired,
};

export default LegislatorDetails;
