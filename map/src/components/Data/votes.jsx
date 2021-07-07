import { graphql, useStaticQuery } from 'gatsby'
import { fromJS } from 'immutable'
import { isDebug } from '../../../util/dom'

export const useVoteData = () => {
  const data = useStaticQuery(graphql`
  query {
    allMongodbRegions {
      votes(limit: 5000000) {
        _id
        rep_legiscan_id
        rep_name
        roll_call_id
        session_name
      }
    }
  }
  `)

  const voteData = data.allMongodbRegions.votes.map(vote => {
    const { rep_legiscan_id } = vote

    return { 
      ...vote
    }
  })

  const voteIndex = voteData.reduce((result, item) => {
    result[item.rep_legiscan_id] = item
    return result
  }, {})

  if (isDebug) {
    window.data = voteData
    window.index = voteIndex
  }

  return [fromJS(voteData), fromJS(voteIndex)]
}

// helpful documentation for working with immutable lists:
// https://thomastuts.com/blog/immutable-js-101-maps-lists.html
// https://immutable-js.github.io/immutable-js/, specifically the Nested Structures section