import { graphql, useStaticQuery } from 'gatsby'
import { fromJS } from 'immutable'
import { isDebug } from '../../../util/dom'

// OR: [{state_abbr: "AZ"}, {state_abbr: "CO"}, {state_abbr: "CT"}, {state_abbr: "FL"}]
export const useRepData = () => {
  const data = useStaticQuery(graphql`
  query {
    allMongodbRegions {
      representatives(
        query: {office: {is_current: true}}
        limit: 10000
        ) {
        _id
        full_name
        cc_score
        party
        role
        state_abbr
        slug
        office {
          is_current
        }
      }
    }
  }
  `)

  const repData = data.allMongodbRegions.representatives;

  const repIndex = repData.reduce((result, item) => {
    result[item._id] = item
    return result
  }, {})

  if (isDebug) {
    window.data = repData
    window.index = repIndex
  }

  return [fromJS(repData), fromJS(repIndex)]
}

// helpful documentation for working with immutable lists:
// https://thomastuts.com/blog/immutable-js-101-maps-lists.html
// https://immutable-js.github.io/immutable-js/, specifically the Nested Structures section
// ccscorecard {
//   intro
//   votes
//   outro
// }