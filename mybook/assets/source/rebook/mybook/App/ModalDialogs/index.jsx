import React from 'react';

import ModalDialog from './ModalDialog';


const ModalDialogs = ({ dialogs }) => {
  return dialogs.map(
    (dialog) => (
      <ModalDialog dialog={dialog} key={dialog.id} />
    )
  );
};

export default ModalDialogs;
