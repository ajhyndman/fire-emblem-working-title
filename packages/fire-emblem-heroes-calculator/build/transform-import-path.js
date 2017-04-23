/* eslint-disable */

module.exports = function(fileInfo, api, options) {
  // transform `fileInfo.source` here
  // ...
  // return changed source
  return fileInfo.source.replace(/'.\//g, "'../src/");
};
