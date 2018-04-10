import { WALLETS_DATA_SET } from 'rebook/apps/users/constants';


export default function userWallets(state = null, action) {
  switch (action.type) {
    case WALLETS_DATA_SET:
      return action.payload;
    default:
      return state;
  }
}
