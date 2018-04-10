export default (count, ...endings) => {
  let endingIdx;
  if (count % 10 === 1 && count % 100 !== 11) {
    endingIdx = 0;
  }
  else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    endingIdx = 1;
  }
  else {
    endingIdx = 2;
  }
  return endings[endingIdx];
};
