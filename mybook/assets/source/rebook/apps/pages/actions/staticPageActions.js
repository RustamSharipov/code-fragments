import fetchQuery from 'rebook/apps/utils/fetchQuery';
import {
  PAGES_STATIC_PAGE_SET_DATA,
  PAGES_STATIC_PAGE_RESET_DATA,
} from 'rebook/apps/pages/constants';


export function fetchInitialData(match) {
  return async(dispatch, getState) => {
    const currentState = getState().staticPage;
    // do not request extra content if already prerendered
    if (!currentState.content) {
      await dispatch(fetchPage(match));
    }
  };
}

export function fetchPage(match) {
  return async(dispatch, getState) => {
    const { ssr } = getState();
    const pageName = match.params.page || 'about';
    const url =`/api/static-page/?name=${pageName}`;
    // clear the page content before the fetch
    dispatch(resetData());
    return fetchQuery(url, { headers: ssr.headers })
      .then(
        ({ data }) => {
          dispatch(setData({ content: data.content }));
        }
      )
      .catch(
        ({ data, resp, error }) => {
          Raven.captureMessage('failed to load static page due to server error', {
            level: 'error',
            extra: {
              status: resp.status,
              response: data,
              error,
            },
          });
          throw new Error('failed to load static page due to server error');
        }
      );
  };
}

export function setData(payload) {
  return {
    type: PAGES_STATIC_PAGE_SET_DATA,
    payload,
  };
}

export function resetData() {
  return {
    type: PAGES_STATIC_PAGE_RESET_DATA,
  };
}
