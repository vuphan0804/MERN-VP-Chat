const getTypeFromFilePath = (path) => {
  const splitedByDot = path.split(".");
  return splitedByDot[splitedByDot.length - 1];
};

module.exports = { getTypeFromFilePath };
