import { USERS_MODAL_DIALOG_POP, USERS_MODAL_DIALOG_REMOVE } from 'rebook/apps/users/constants';


export default function modalDialogs(state = [], action) {
  switch (action.type) {
    // add new modal dialog to the stack
    case USERS_MODAL_DIALOG_POP:
      // remove an existing modal dialog with the same id
      const cleanState = state.filter((modalDialog) => {
        return modalDialog.content !== action.payload.content;
      });
      return [...cleanState, action.payload];

    // remove a modal dialog by it's id
    case USERS_MODAL_DIALOG_REMOVE:
      return state.filter((modalDialog) => {
        return modalDialog.id !== action.payload;
      });
    default:
      return state;
  }
}
