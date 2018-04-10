const units = [
  { divisor: 1024 * 1024 * 1024, unit: 'Гб' },
  { divisor: 1024 * 1024, unit: 'Мб' },
  { divisor: 1024, unit: 'Кб' },
];

export default (value) => {
  // Get first matched element from unit list
  const result = units.filter(
    (item) => value / item.divisor >= 1
  )[0];
  return `${value / result.divisor} ${result.unit}`;
};
