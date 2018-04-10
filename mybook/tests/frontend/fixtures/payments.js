import { Factory } from 'rosie';

import uuid4 from 'rebook/apps/utils/random/uuid4';


export const AmountPeriodFactory = (
  new Factory()
    .sequence('id')
    .attrs({
      name: () => 'InPlat',
      slug: () => 'inplat',
    })
);

export const PaymentFactory = (
  new Factory()
    .attrs({
      uuid: () => uuid4(),
      status: () => 'new',
      amount: () => '199.00',
      currency: () => 'RUB',
      phone: () => '+79991234567',
      method: () => AmountPeriodFactory.build(),
      redirect_url: () => null,
      subscription_type: () => 'standard',
      standard_payed_from: () => null,
      standard_payed_till: () => null,
      pro_payed_from: () => null,
      pro_payed_till: () => null,
    })
);

export const RedeemCodeCampaignFactory = (
  new Factory()
    .attrs({
      discount: () => 25,
      discount_type: () => 'percent',
      max_percent_discount: () => 30,
      min_amount_order: () => 500,
      subscription_periods: () => ['month', 'months3', 'year'],
      subscription_types: () => ['standard', 'pro'],
    })
);

export const WalletFactory = (
  new Factory()
    .sequence('id')
    .attrs({
      is_deactivatable: () => true,
      method: () => 'Кредитной картой',
      next_rebill_date: () => '2021-06-28',
      slug: () => 'credit_card',
      subscription_type: () => 'pro',
    })
);

export const GiftFactory = (
  new Factory()
    .sequence('id')
    .attrs({
      code: () => uuid4(),
    })
);

export const defaultPriceMatrix = {
  pro: {
    1: {
      full_price: 379,
      advert_price_for_user: 180,
    },
    3: {
      full_price: 1090,
      advert_price_for_user: 900,
    },
    12: {
      full_price: 3790,
      advert_price_for_user: 3600,
    },
  },
  standard: {
    1: {
      full_price: 199,
      advert_price_for_user: 199,
    },
    3: {
      full_price: 559,
      advert_price_for_user: 559,
    },
    12: {
      full_price: 1999,
      advert_price_for_user: 1999,
    },
  },
};
