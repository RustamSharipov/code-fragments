import { USERS_AUTHFORM_SHOW, USERS_AUTHFORM_HIDE } from 'rebook/apps/users/constants';


export default function authForm(state = {}, action) {
  switch (action.type) {
    case USERS_AUTHFORM_SHOW:
      return { isActive: true };
    case USERS_AUTHFORM_HIDE:
      return { isActive: false };
    default:
      return state;
  }
}
