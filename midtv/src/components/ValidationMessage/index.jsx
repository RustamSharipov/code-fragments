import React from 'react';
import classNames from 'classnames';

import styles from './style.css';


const ValidationMessage = ({ children, type }) => {
  if (!children) {
    return null;
  }

  let messageTypeClassName = null;

  if (type === 'error') {
    messageTypeClassName = styles.isError;
  }

  else if (type === 'success') {
    messageTypeClassName = styles.isSuccess;
  }

  return (
    <div className={classNames(styles.validationMessage, messageTypeClassName)}>
      {children}
    </div>
  );
}

export default ValidationMessage;
