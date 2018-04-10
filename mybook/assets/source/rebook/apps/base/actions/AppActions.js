import * as PromoCampaignActions from 'rebook/apps/advert/actions/PromoCampaignActions';
import * as UserActions from 'rebook/apps/users/actions/UserActions';
import * as PaymentsActions from 'rebook/apps/payments/actions/PaymentsActions';


// eslint-disable-next-line import/prefer-default-export
export function fetchInitialData() {
  // fetch required global context for the app
  return async(dispatch, getState) => {
    const { user, promoCampaign, payments } = getState();
    let promises = [];

    if (!user) {
      promises.push(dispatch(UserActions.fetchCurrentUser()));
    }

    if (!promoCampaign) {
      promises.push(dispatch(PromoCampaignActions.fetchActivePromoCampaign()));
    }

    if (!payments.prices) {
      promises.push(dispatch(PaymentsActions.fetchPrices()));
    }

    await (promises.length > 0 ? Promise.all(promises) : Promise.resolve(null));
  };
}
