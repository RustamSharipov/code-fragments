import queryString from 'query-string';
import Raven from 'raven-js';

import fetchQuery from 'rebook/apps/utils/fetchQuery';
import { PAYMENTS_DATA_SET } from 'rebook/apps/payments/constants';
import { getLocalDateTime, getCurrentDateTime } from 'rebook/apps/utils/datetime';


export function fetchPrices() {
  return async(dispatch, getState) => {
    const { payments, ssr } = getState();
    const { redeemCode, isGift } = payments;
    let queryParams = {};
    let url;
    if (redeemCode.code && redeemCode.campaign) {
      queryParams.redeem_code = redeemCode.code;
    }
    if (isGift) {
      queryParams.gift = '1';
    }
    if (Object.keys(queryParams).length === 0) {
      url = '/api/prices/';
    }
    else {
      url = `/api/prices/?${queryString.stringify(queryParams)}`;
    }
    await fetchQuery(url, { headers: ssr.headers })
      .then(({ data }) => {
        dispatch(setData({ prices: data }));
        // recalculate user price when prices change
        dispatch(calculateUserPrice());
        // update 1 month subscription prices when global prices change
        dispatch(updateSubscriptionTypes());
      })
      .catch(
        ({ data, resp, error }) => {
          Raven.captureMessage('failed to fetch prices due to server error', {
            level: 'error',
            extra: {
              status: resp ? resp.status : null,
              response: data,
              error,
            },
          });
        }
      );
  };
}

export function fetchInitialData(history) {
  // attempt parse initial data from querystring
  return (dispatch) => {
    const queryParams = queryString.parse(history.location.search);
    let initialState = {};

    // support various legacy sub type params (the true param name is subscription_type)
    const querySubscriptionType = queryParams.subscription_type || queryParams.sub_type || queryParams.payment_type;
    if (querySubscriptionType) {
      initialState.subscriptionType = {
        standard: 'standard',
        pro: 'pro',
        1: 'standard',
        2: 'pro',
      }[querySubscriptionType] || null;
    }

    if (queryParams.months) {
      initialState.subscriptionPeriod = queryParams.months;
    }

    // automatically redeem code from url
    if (queryParams.redeem_code) {
      initialState.redeemCode = {
        code: queryParams.redeem_code,
        campaign: null,
      };
    }

    if (queryParams.method) {
      initialState.paymentMethod = queryParams.method;
    }

    if (queryParams.gift === '1') {
      initialState.isGift = true;
    }

    dispatch(updateState({
      state: initialState,
      query: queryParams,
      history,
    }));
  };
}

export function updateRedeemCode(redeemCode, history) {
  // update the currently active redeem code and refresh the prices
  return (dispatch) => {
    let redeemCodeState = {
      code: null,
      campaign: null,
    };
    if (redeemCode) {
      redeemCodeState = {
        code: redeemCode.code,
        campaign: redeemCode.campaign,
      };
    }
    dispatch(updateState({
      state: {
        redeemCode: redeemCodeState,
      },
      // do not update query with activated promocode due to security concerns
      query: {},
      history,
    }));
    // fetch updated prices
    dispatch(fetchPrices());
  };
}

export function restoreRedeemCode(history) {
  // restore the last activated promo code,
  // so the user does not have to activate it again on page reload
  return (dispatch) => {
    fetchQuery('/api/promocode/restore/', { method: 'post' })
      .then(({ data, resp }) => {
        if (resp.status === 200) {
          dispatch(updateRedeemCode(data, history));
        }
      })
      .catch(({ data, resp }) => {
        Raven.captureMessage('failed to restore active redeem code due to server error', {
          level: 'error',
          extra: {
            status: resp.status,
            response: data,
          },
        });
      });
  };
}

export function calculateUserPrice() {
  // recalculate user price based on currently selected subscription params
  // such as period, subscription type, activated promocode, etc
  return (dispatch, getState) => {
    const { prices, subscriptionType, subscriptionPeriod } = getState().payments;

    if (!(prices && subscriptionType && subscriptionPeriod)) {
      // cant calculate user price due to lack of required params
      return;
    }

    const priceParams = prices[subscriptionType][subscriptionPeriod];
    const {
      advert_price_for_user: advertPrice,
      full_price: fullPrice,
      redeem_code_discount: redeemCodeDiscountAmount,
      redeem_code_discount_percent: redeemCodeDiscountPercent,
    } = priceParams;
    let finalPrice = advertPrice;

    // deduct redeem code discount that is available for selected period & subscription type
    if (redeemCodeDiscountAmount) {
      finalPrice -= redeemCodeDiscountAmount;
    }

    // calculate the total price discount for the user
    const discountAmount = fullPrice > finalPrice ? fullPrice - finalPrice : 0;

    dispatch(setData({
      userPrice: {
        fullPrice,
        advertPrice,
        finalPrice,
        discountAmount,
        redeemCodeDiscountAmount,
        redeemCodeDiscountPercent,
      },
    }));
  };
}

export function updateSubscriptionTypes() {
  return (dispatch, getState) => {
    const { user, payments, userWallets } = getState();
    const { prices, subscriptionTypes: currentState } = payments;
    const currentTime = getCurrentDateTime();
    let standardSubscriptionIsOutdated, proSubscriptionIsOutdated;

    if (user) {
      standardSubscriptionIsOutdated = user.subscription_standard_active_till
        ? getLocalDateTime(user.subscription_standard_active_till) < currentTime
        : false;
      proSubscriptionIsOutdated = user.subscription_pro_active_till
        ? getLocalDateTime(user.subscription_pro_active_till) < currentTime
        : false;
    }

    const newState = {
      pro: {
        ...currentState.pro,
        price: prices ? prices.pro['1'].advert_price_for_user : null,
        userActiveTill: user && !proSubscriptionIsOutdated ? user.subscription_pro_active_till : null,
        userIsActive: user && !!user.subscription_pro_active_till && !proSubscriptionIsOutdated,
        userWallets: userWallets
          ? userWallets.filter((item) => item.subscription_type === 'pro')
          : null,
      },
      standard: {
        ...currentState.standard,
        price: prices ? prices.standard['1'].advert_price_for_user : null,
        userActiveTill: user && !standardSubscriptionIsOutdated ? user.subscription_standard_active_till : null,
        userIsActive: (
          user
          && !!user.subscription_standard_active_till
          && user.subscription_standard_active_till !== user.subscription_pro_active_till
          && !standardSubscriptionIsOutdated
        ),
        userWallets: userWallets
          ? userWallets.filter((item) => item.subscription_type === 'standard')
          : null,
      },
    };

    dispatch(setData({ subscriptionTypes: newState }));
  };
}

export function updateState({ state, query, history, isHistoryPush }) {
  // Updates both reducer's and the history state with given objects
  return (dispatch) => {
    dispatch(setData(state));
    if (query) {
      // by default all querystring updates are done in place, i.e. no new history item is created
      // unless specified otherwise
      const currentState = history.location.state || {};
      const newSearch = {
        ...queryString.parse(history.location.search),
        ...query,
      };
      const newLocation = {
        ...history.location,
        search: queryString.stringify(newSearch),
        // pass state along with history change,
        // so when user goes back and forth in browser history, the state persists
        state: {
          ...currentState,
          ...state,
        },
      };
      // do a push rather than replace
      // so a user can "back" and "forward" to previous and the new url
      if (isHistoryPush) {
        history.push(newLocation);
      }
      else {
        history.replace(newLocation);
      }
    }
    dispatch(calculateUserPrice());
  };
}

export function setData(payload) {
  return {
    type: PAYMENTS_DATA_SET,
    payload,
  };
}
