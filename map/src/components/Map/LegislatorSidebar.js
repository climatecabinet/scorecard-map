import React from 'react';
import LegislatorDetails from './LegislatorDetails';
import PropTypes from 'prop-types';

const LegislatorSidebar = ({ representativeId, regionName, instructions }) => {
  // TODO(mike): Maybe return an empty div with some height instead of all the optional chaining.
  return (
    <div className="aside" id="aside">
      <div className="candidateText">LEGISLATOR DETAILS</div>
      {instructions && (
        <div className="instructions" id="instructions">
          {instructions}
        </div>
      )}
      {representativeId && regionName && (
        <LegislatorDetails representativeId={representativeId} regionName={regionName} />
      )}
    </div>
  );
};

LegislatorSidebar.propTypes = {
  representativeId: PropTypes.string,
  regionName: PropTypes.string,
  instructions: PropTypes.string,
};

export default LegislatorSidebar;
