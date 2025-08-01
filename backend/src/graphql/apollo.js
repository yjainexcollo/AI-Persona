// src/graphql/apollo.js
const { ApolloServer } = require("apollo-server-express");
const depthLimit = require("graphql-depth-limit");
// const costAnalysis = require("graphql-cost-analysis"); // Temporarily disabled
const schema = require("./schema");
const context = require("./context");
const logger = require("../utils/logger");

function createApolloServer() {
  return new ApolloServer({
    schema,
    context,
    introspection: process.env.NODE_ENV !== "production",
    playground: process.env.NODE_ENV !== "production",
    plugins: [
      // Query depth limiting
      {
        requestDidStart: () => ({
          validationDidStart: () => ({
            didValidate: ({ result }) => {
              if (result.errors && result.errors.length > 0) {
                logger.warn("GraphQL validation errors: %o", result.errors);
              }
            },
          }),
        }),
      },
    ],
    validationRules: [
      // Limit query depth to 7 levels
      depthLimit(7, { ignore: ["__typename"] }),
      // Cost analysis - temporarily disabled due to compatibility issues
      // costAnalysis({
      //   maximumCost: 5000,
      //   defaultCost: 1,
      //   variables: ["first", "last"],
      //   createError: (cost, max) => {
      //     return new Error(
      //       `GraphQL query cost (${cost}) exceeds maximum (${max})`
      //     );
      //   },
      // }),
    ],
    formatError: (err) => {
      logger.error("GraphQL Error: %o", err);
      return err;
    },
  });
}

module.exports = createApolloServer;
