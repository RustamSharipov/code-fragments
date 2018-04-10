import React from 'react';
import classNames from 'classnames';

import styles from './style.css';


const Dialog = ({ children }) => {
  return (
    <div className={styles.dialog}>
      <div className={classNames(styles.container, 'gridColumn cols-4')}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
