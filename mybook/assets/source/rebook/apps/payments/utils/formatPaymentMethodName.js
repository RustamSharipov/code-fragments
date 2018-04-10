import { PAYMENT_METHODS } from 'rebook/apps/payments/constants';


export default (slug, phraseCase, description) => {
  const nameCase = phraseCase ? phraseCase.toUpperCase() : 'NOM';
  const paymentMethods = {
    credit_card: PAYMENT_METHODS.CREDIT_CARD[nameCase],
    gift: PAYMENT_METHODS.GIFT_CODE[nameCase],
    'google-play': PAYMENT_METHODS.GOOGLE_PLAY,
    inplat: PAYMENT_METHODS.SMS,
    inplatmk: PAYMENT_METHODS.SMS,
    itunes: PAYMENT_METHODS.ITUNES,
    paypal: PAYMENT_METHODS.PAYPAL,
    yandexmoney: PAYMENT_METHODS.YANDEX_MONEY[nameCase],
  };

  let paymentMethodName = null;

  if (paymentMethods[slug]) {
    paymentMethodName = paymentMethods[slug];
  }

  if (description) {
    paymentMethodName = `${paymentMethodName} ${description}`;
  }

  return paymentMethodName;
};
