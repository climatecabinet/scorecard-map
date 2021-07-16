const config = require('./config/meta');
const {createHttpLink} = require("apollo-link-http");
const fetch = require("isomorphic-fetch");

// require("dotenv").config({
//   path: `.env.${process.env.NODE_ENV}`,
// })

module.exports = {
  siteMetadata: {
    title: config.siteTitle,
    description: config.siteDescription,
    author: config.schema.author,
    mapboxToken: `pk.eyJ1IjoicGFzaWgiLCJhIjoiY2pybzJqdTVjMHJzeDQ0bW80aGdzaXV3ayJ9.yxD8Nqu7FLnf8-lBo7F1zQ`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // arbitrary name for the remote schema query type
        typeName: 'MongoDB', 
        // field under which the remote schema will be accessible. will be used in the gatsby query
        fieldName: 'allMongodbRegions',
        // create Apollo Link manually. can return a Promise.
        createLink: () => 
          createHttpLink({
            uri: 'https://us-west-2.aws.realm.mongodb.com/api/client/v2.0/app/ccscorecard-experimental-gubqp/graphql',
              headers: {
                apiKey: `A1RJYVgCktjnwsajZuqOPrqHE14NANh0I0lOIde5Fbxdz1r80jItkfe4QiZz6gdV`
              },
              fetch,
          })
      }
    },
    // `gatsby-transformer-json`,
    // `gatsby-transformer-sharp`,
    // `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: process.env.NODE_ENV !== `production`,
        fileName: false,
      },
    },
    // {
    //   resolve: `gatsby-plugin-typography`,
    //   options: {
    //     pathToConfigModule: `./config/typography.js`,
    //   },
    // },
    // // `gatsby-transformer-sharp`,
    // // `gatsby-plugin-sharp`,
    // `gatsby-plugin-catch-links`,
    // {
    //   resolve: `gatsby-plugin-manifest`,
    //   options: {
    //     name: config.siteTitle,
    //     short_name: config.siteTitleShort,
    //     description: config.siteDescription,
    //     start_url: `/?utm_source=a2hs`,
    //     background_color: config.manifest.backgroundColor,
    //     theme_color: config.manifest.themeColor,
    //     display: `standalone`,
    //     icon: `src/images/clicab-icon.jpg`, // This path is relative to the root of the site.
    //   },
    // },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
