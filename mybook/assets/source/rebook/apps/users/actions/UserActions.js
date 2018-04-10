import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import { USERS_USER_SET, USERS_USER_REMOVE, USERS_AUTH_LOGIN_NOTIFICATIONS } from 'rebook/apps/users/constants';


export function fetchCurrentUser(onSuccess) {
  return async(dispatch, getState) => {
    const { ssr } = getState();
    // fetch the current's user profile details
    await fetchQuery('/api/profile/', { apiVersion: 4, headers: ssr.headers })
      .then(
        ({ data }) => {
          const userObject = data.objects[0];
          dispatch(setUser(userObject));
          if (onSuccess) {
            onSuccess();
          }
        }
      )
      .catch(
        ({ data, resp, error }) => {
          if (resp && resp.status === 401) {
            dispatch(removeUser());
          }
          else {
            Raven.captureMessage('failed to authenticated user due to error', {
              level: 'error',
              extra: {
                status: resp ? resp.status : null,
                data,
                error,
              },
            });
            dispatch(NotificationActions.pop(USERS_AUTH_LOGIN_NOTIFICATIONS.ERROR));
          }
        }
      );
  };
}

export function unAuthenticateUser() {
  return (dispatch) => {
    fetchQuery('/api/unauth/', { method: 'post' })
      .then(
        () => {
          dispatch(removeUser());
          dispatch(NotificationActions.pop(USERS_AUTH_LOGIN_NOTIFICATIONS.LOGOUT));
        }
      )
      .catch(
        ({ data, resp }) => {
          // already unauthenticated? pretend the user successfully logged out
          if (resp.status === 403) {
            dispatch(removeUser());
            dispatch(NotificationActions.pop(USERS_AUTH_LOGIN_NOTIFICATIONS.LOGOUT));
          }
          else {
            Raven.captureMessage('failed to logout user due to server error', {
              level: 'error',
              extra: {
                status: resp.status,
                data,
              },
            });
            dispatch(NotificationActions.pop(USERS_AUTH_LOGIN_NOTIFICATIONS.ERROR));
          }
        }
      );
  };
}

export function setUser(user) {
  return {
    type: USERS_USER_SET,
    payload: user,
  };
}

export function removeUser() {
  return {
    type: USERS_USER_REMOVE,
  };
}
