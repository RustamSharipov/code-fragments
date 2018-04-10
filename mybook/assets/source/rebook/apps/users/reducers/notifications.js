import { USERS_NOTIFICATION_POP, USERS_NOTIFICATION_REMOVE } from 'rebook/apps/users/constants';


export default function notifications(state = [], action) {
  switch (action.type) {
    // add new notification to the stack
    case USERS_NOTIFICATION_POP:
      // remove an existing notification with the same text
      const cleanState = state.filter((notification) => {
        return notification.text !== action.payload.text;
      });
      return [...cleanState, action.payload];
    // remove a notification by it's id
    case USERS_NOTIFICATION_REMOVE:
      return state.filter((notification) => {
        return notification.id !== action.payload;
      });
    default:
      return state;
  }
}
