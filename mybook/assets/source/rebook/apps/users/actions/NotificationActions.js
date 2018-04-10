import uuid4 from 'rebook/apps/utils/random/uuid4';
import { USERS_NOTIFICATION_POP, USERS_NOTIFICATION_REMOVE } from 'rebook/apps/users/constants';


const createNotification = (text) => {
  return {
    id: uuid4(),
    text,
  };
};

export function pop(text, type) {
  return (dispatch) => {
    const icons = {
      success: '🎉',
      error: '😞',
      done: '✅',
    };
    const message = icons[type] ? `${icons[type]} ${text}` : text;
    const notification = createNotification(message);

    // fire a notification, then remove it in 5 secs
    dispatch({
      type: USERS_NOTIFICATION_POP,
      payload: notification,
    });
    setTimeout(() => {
      dispatch(remove(notification.id));
    }, 5000);
  };
}

export function remove(notificationId) {
  return {
    type: USERS_NOTIFICATION_REMOVE,
    payload: notificationId,
  };
}
