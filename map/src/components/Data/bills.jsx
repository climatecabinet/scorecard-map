import { graphql, useStaticQuery } from 'gatsby'
import { fromJS } from 'immutable'
import { isDebug } from '../../../util/dom'

export const useBillData = () => {
  const data = useStaticQuery(graphql`
  query {
    allMongodbRegions {
      bills(limit: 100000) {
        legiscan_id
        bill_status
        bill_type
        description
        sponsors {
            sponsor_id
        }
        subjects
      }
    }
  }
  `)

  const billData = data.allMongodbRegions.bills.map(bill => {
    const { legiscan_id } = bill

    return { 
      ...bill
    }
  })

  const billIndex = billData.reduce((result, item) => {
    result[item.legiscan_id] = item
    return result
  }, {})

  if (isDebug) {
    window.data = billData
    window.index = billIndex
  }

  return [fromJS(billData), fromJS(billIndex)]
}

// helpful documentation for working with immutable lists:
// https://thomastuts.com/blog/immutable-js-101-maps-lists.html
// https://immutable-js.github.io/immutable-js/, specifically the Nested Structures section