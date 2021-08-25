import React from 'react';
import LegislatorDetails from './LegislatorDetails';

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
      <LegislatorDetails representativeId={representativeId} regionName={regionName} />
    </div>
  );
};

export default LegislatorSidebar;
