// import type { JestConfigWithTsJest } from "ts-jest";

// export const config: JestConfigWithTsJest = {
//   verbose: true,
//   transform: {
//     "^.+\\.ts?$": [
//       "ts-jest",
//       {
//         useESM: true,
//       },
//     ],
//   },
//   extensionsToTreatAsEsm: [".ts"],
//   moduleNameMapper: {
//     "^(\\.{1,2}/.*)\\.js$": "$1",
//   },
// };

// export default config;

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // extensionsToTreatAsEsm: [".js"], // For ES Modules (do not include .js extenstion - will throw an error)
  globals: {
    "ts-jest": {
      useESM: true, // Enable ESM support for TypeScript
    },
  },
};
