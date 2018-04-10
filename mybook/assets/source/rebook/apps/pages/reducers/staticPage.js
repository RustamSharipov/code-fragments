import {
  PAGES_STATIC_PAGE_SET_DATA,
  PAGES_STATIC_PAGE_RESET_DATA,
} from 'rebook/apps/pages/constants';


export default function staticPage(state = {}, action) {
  const initialState = {
    content: null,
  };
  switch (action.type) {
    case PAGES_STATIC_PAGE_SET_DATA:
      return {
        ...initialState,
        ...state,
        ...action.payload,
      };
    case PAGES_STATIC_PAGE_RESET_DATA:
      return initialState;
    default:
      return state;
  }
}
