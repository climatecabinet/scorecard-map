import React from 'react';
import LegislatorDetails from './LegislatorDetails';
import PropTypes from 'prop-types';

const LegislatorSidebar = ({ representativeList, isMMD, regionName, instructions }) => {
  // TODO(mike): Maybe return an empty div with some height instead of all the optional chaining.
  return (
    <div className="aside" id="aside">
      <div className="candidateText">LEGISLATOR DETAILS</div>
      {/* instructions */}
      {instructions && (
        <div className="instructions" id="instructions">
          {instructions}
        </div>
      )}
      {/* representatives - rep 1 */}
      {representativeList[0] && regionName && (
        <LegislatorDetails representativeId={representativeList[0]} regionName={regionName} />
      )}
      {/* representatives - rep 2 */}
      {isMMD && representativeList[1] && regionName && (
        <LegislatorDetails representativeId={representativeList[1]} regionName={regionName} />
      )}
      {/* representatives - rep 3 */}
      {isMMD && representativeList[2] && regionName && (
        <LegislatorDetails representativeId={representativeList[2]} regionName={regionName} />
      )}
      {/* representatives - rep 4 */}
      {isMMD && representativeList[3] && regionName && (
        <LegislatorDetails representativeId={representativeList[3]} regionName={regionName} />
      )}
      {/* representatives - rep 5 */}
      {isMMD && representativeList[4] && regionName && (
        <LegislatorDetails representativeId={representativeList[4]} regionName={regionName} />
      )}
    </div>
  );
};

LegislatorSidebar.propTypes = {
  representativeList: PropTypes.array,
  regionName: PropTypes.string,
  instructions: PropTypes.string,
};

export default LegislatorSidebar;
