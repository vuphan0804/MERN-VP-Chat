const getFileTypeFromFilePath = (path) => {
  const splitedByDot = path.split(".");
  return splitedByDot[splitedByDot.length - 1];
};

const getFileNameFromFilePath = (path) => {
  const splitedBySlash = path.split("/");
  return splitedBySlash[splitedBySlash.length - 1];
};

module.exports = { getFileTypeFromFilePath, getFileNameFromFilePath };
