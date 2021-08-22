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

const VoteTab = ({ tabNumber, isActive, onClick }) => {
  const className = isActive ? 'voteTabActive' : 'voteTabInactive';
  return (
    <div id={`vote${tabNumber}Tab`} className={className} onClick={onClick}>
      Vote {tabNumber}
    </div>
  );
};

const LegislatorDetails = ({ representativeId, regionName }) => {
  const [selectedVoteNumber, setSelectedVoteNumber] = useState(1);
  const { loading, error, data } = useQuery(GET_REP_DETAILS, {
    variables: { representativeId },
    skip: !representativeId,
  });
  if (loading) {
    return <p>loading!</p>;
  }

  // TODO(mike): remove?
  if (!data) {
    return null;
  }

  const { representative: rep } = data;

  if (!representativeId) {
    return null;
  }

  return (
    <div id="details" className="details">
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
        <div className="votesText">Selected Climate Votes</div>
        <div className="voteTabs">
          {[5, 4, 3, 2, 1].map((tabNumber) => (
            <VoteTab
              key={tabNumber}
              tabNumber={tabNumber}
              isActive={tabNumber == selectedVoteNumber}
              onClick={() => setSelectedVoteNumber(tabNumber)}
            />
          ))}
        </div>
        <br />
        <br />
        <div id="vote1" className="vote">
          {rep.ccscorecard.votes[selectedVoteNumber] || NO_VOTE_FALLBACK_TEXT}
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

export default LegislatorDetails;
