import uuid4 from 'rebook/apps/utils/random/uuid4';
import { USERS_MODAL_DIALOG_POP, USERS_MODAL_DIALOG_REMOVE } from 'rebook/apps/users/constants';


const createModalDialog = (params) => {
  return {
    id: uuid4(),
    ...params,
  };
};

export function pop(params) {
  return (dispatch) => {
    const modalDialog = createModalDialog(params);
    dispatch({
      type: USERS_MODAL_DIALOG_POP,
      payload: modalDialog,
    });
  };
}

export function remove(modalDialogId) {
  return {
    type: USERS_MODAL_DIALOG_REMOVE,
    payload: modalDialogId,
  };
}
