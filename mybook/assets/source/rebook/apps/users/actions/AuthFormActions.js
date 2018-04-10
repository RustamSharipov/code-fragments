import { USERS_AUTHFORM_SHOW, USERS_AUTHFORM_HIDE } from 'rebook/apps/users/constants';


export function showForm() {
  return {
    type: USERS_AUTHFORM_SHOW,
  };
}

export function hideForm() {
  return {
    type: USERS_AUTHFORM_HIDE,
  };
}
