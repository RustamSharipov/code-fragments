import { USERS_USER_SET, USERS_USER_REMOVE } from 'rebook/apps/users/constants';


export default function user(state = null, action) {
  switch (action.type) {
    case USERS_USER_SET:
      return action.payload;
    case USERS_USER_REMOVE:
      return null;
    default:
      return state;
  }
}
