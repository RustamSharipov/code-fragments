import { BASE_SSR_SET_DATA } from 'rebook/apps/base/constants';


export function setHeaders(headers) {
  return (dispatch) => {
    dispatch(setData({
      headers,
    }));
  };
}

export function setData(payload) {
  return {
    type: BASE_SSR_SET_DATA,
    payload,
  };
}
