import { graphql, useStaticQuery } from 'gatsby'
import { fromJS } from 'immutable'
import { isDebug } from '../../../util/dom'

export const useRollCallData = () => {
  const data = useStaticQuery(graphql`
  query {
    allMongodbRegions {
      roll_calls(limit: 200000) {
        bill_id
        passed
        _id
        nay
        total
        session
        legiscan_id
      }
    }
  }
  `)

  const rollCallData = data.allMongodbRegions.roll_calls.map(roll_call => {
    const { legiscan_id } = roll_call

    return { 
      ...roll_call
    }
  })

  const rollCallIndex = rollCallData.reduce((result, item) => {
    result[item.legiscan_id] = item
    return result
  }, {})

  if (isDebug) {
    window.data = rollCallData
    window.index = rollCallIndex
  }

  return [fromJS(rollCallData), fromJS(rollCallIndex)]
}

// helpful documentation for working with immutable lists:
// https://thomastuts.com/blog/immutable-js-101-maps-lists.html
// https://immutable-js.github.io/immutable-js/, specifically the Nested Structures section