const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./src/",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testTimeout: 60000,
};

module.exports = createJestConfig(customJestConfig);
