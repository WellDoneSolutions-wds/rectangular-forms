const { defaults: tsjPreset } = require("ts-jest/presets");

const defaults = {
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  testURL: "http://localhost",
};

const NORMAL_TEST_FOLDERS = [
  "components",
  "hooks",
  "integration",
  "utils",
  "form",
  "addons",
];

const tsTestFolderPath = (folderName) =>
  `<rootDir>/test/${folderName}/**/*.{ts,tsx}`;

const tsStandardConfig = {
  ...defaults,
  displayName: "ReactDOM",
  preset: "ts-jest",
  testMatch: NORMAL_TEST_FOLDERS.map(tsTestFolderPath),
};

module.exports = {
  projects: [tsStandardConfig],
};
