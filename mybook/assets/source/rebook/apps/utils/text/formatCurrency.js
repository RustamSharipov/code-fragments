const CURRENCY_SYMBOLS = {
  RUB: '₽',
  USD: '$',
};

const formatCurrency = (amount, currency) => {
  const formattedAmount = parseInt(amount);
  const formattedCurrency = CURRENCY_SYMBOLS[currency];
  return `${formattedAmount} ${formattedCurrency}`;
};

export default formatCurrency;
