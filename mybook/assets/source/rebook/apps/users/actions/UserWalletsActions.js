import fetchQuery from 'rebook/apps/utils/fetchQuery';
import { WALLETS_DATA_SET } from 'rebook/apps/users/constants';


export function fetchWallets() {
  return (dispatch) => {
    const url = '/api/wallets/';
    fetchQuery(url)
      .then(({ data }) => {
        const wallets = data.objects.length > 0 ? data.objects : null;
        dispatch(setWallets(wallets));
      })
      .catch(
        ({ data, resp, error }) => {
          Raven.captureMessage('failed to fetch wallets due to error', {
            level: 'error',
            extra: {
              status: resp ? resp.status : null,
              data,
              error,
            },
          });
        }
      );
  };
}

export function setWallets(payload) {
  return {
    type: WALLETS_DATA_SET,
    payload,
  };
}
