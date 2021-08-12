import React, { useEffect } from "react"
// import { graphql } from 'gatsby'
import Map from '../components/Map/Map'

const IndexPage = () => (
    <div>
        <Map />
    </div>
)

// const IndexPage = ({data}) => {
//     // client-side runtime data fetching
//     // const [repName, setRepName] = useState('NA')
//     const CC_API_KEY = "e5WolP3ekUwIQNvx7O01FgnhOFFwv9r43gV6PDlX4jIi1cWmMdPcXli6epxIRtDz";
//     const full_name = "Timothy Ackert";
//     const query = `query VoteQuery($full_name: String) {
//         allMongodbRegions {
//             representatives(query: {full_name: {eq: $full_name}}) {
//                 _id
//                 ccscorecard {
//                     intro
//                     votes
//                     outro
//                 }
//                 full_name
//             }
//         }
//     }`;

//     // get data from mongodb
//     useEffect(() => {
//         const response = fetch(`https://us-west-2.aws.realm.mongodb.com/api/client/v2.0/app/climate-cabinet-production-esyps/auth/providers/api-key/login`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: `{
//                 "key": "${CC_API_KEY}",
//             }`,
//         })
        
//         console.log(response)


//         // const ccAPITokens = response.json();

//         // fetch(`https://us-west-2.aws.realm.mongodb.com/api/client/v2.0/app/climate-cabinet-production-esyps/graphql`, {
//         //     method: 'POST',
//         //     headers: {
//         //         'Authorization': "Bearer" + ccAPITokens.access_token,
//         //         'Content-Type': 'application/json'
//         //     },
//         //     body: JSON.stringify({
//         //         query,
//         //         variables: { full_name },
//         //     })
//         // })
//         // .then(r => r.json())
//         // .then(data = console.log("data returned:", data));
//     })
    
//     return (
//         <div>
//             {/* Hello, World! */}
//             <Map />
//         </div>
//     )
// }

// export const query = graphql`
//     query VoteQuery($full_name: String) {
//         allMongodbRegions {
//             representatives(full_name: {eq: $full_name}) {
//                 _id
//                 ccscorecard {
//                     intro
//                     votes
//                     outro
//                 }
//                 full_name
//             }
//         }
//     }
// `

export default IndexPage