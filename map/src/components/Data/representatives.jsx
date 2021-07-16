import { graphql, useStaticQuery } from 'gatsby'
import { fromJS } from 'immutable'
import { isDebug } from '../../../util/dom'

// TODO: only bring in the ones where is_current is True
export const useRepData = () => {
  const data = useStaticQuery(graphql` 
  query {
    allMongodbRegions {
      representatives(limit: 10000) {
        _id
        full_name
        cc_score
        party
        role
      }
    }
  }
  `)

  // TODO: add pulling in votes & remove votes file
  // ccscorecard {
  //   intro
  //   votes
  //   outro
  // }

  const repData = data.allMongodbRegions.representatives.map(representative => {
    const { _id } = representative

    return { 
      ...representative
    }
  })

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