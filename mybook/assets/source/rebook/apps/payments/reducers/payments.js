import { PAYMENTS_DATA_SET } from 'rebook/apps/payments/constants';
import { BOOK_PER_SUBSCRIPTION_COUNT } from 'rebook/apps/books/constants';


const initialState = {
  prices: null,
  isAutoRebill: true,
  subscriptionType: null,
  subscriptionPeriod: '12',
  paymentMethod: 'credit_card',
  isGift: false,
  redeemCode: {
    code: null,
    campaign: null,
  },
  userPrice: {
    // the price the user would have normally paid for selected period&sub
    fullPrice: null,
    // the price the user will pay if she submits the form with selected sub params (but without a promocode)
    // this price may include various discount stuff, such as subscription upgrade discount, advert campaign discount
    // and probably more in the future, but not a promocode
    advertPrice: null,
    // the price the user will pay if she submits the form with selected sub params and activated promocode
    finalPrice: null,
    // total price discount for the user
    // ie this is the difference between the full period price and the final price for the user
    discountAmount: null,
    // redeem code discount
    redeemCodeDiscountAmount: null,
    redeemCodeDiscountPercent: null,
  },
  // list of available subscription types and their user or price specific params
  subscriptionTypes: {
    pro: {
      type: 'pro',
      description: `Доступ ко всем ${BOOK_PER_SUBSCRIPTION_COUNT['total']} книгам каталога, включая новинки, ` +
                   `бизнес-литературу и книги по саморазвитию.`,
      price: null,
      userActiveTill: null,
      userWallets: null,
    },
    standard: {
      type: 'standard',
      description: `Классика и бестселлеры, всего ${BOOK_PER_SUBSCRIPTION_COUNT['standard_free']} книг. ` +
                   `В подписку не входят свежие поступления и бизнес-книги.`,
      price: null,
      userActiveTill: null,
      userWallets: null,
    },
  },
};

export default function payments(state = initialState, action) {
  switch (action.type) {
    case PAYMENTS_DATA_SET:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
