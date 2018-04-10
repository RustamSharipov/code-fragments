import React from 'react';
import classNames from 'classnames';

import { SOCIAL_LOGINS } from './constants';
import styles from './style.scss';


const AuthFormSocialAuth = ({ extraClassName }) => {
  return (
    <div className={classNames(styles.socialAuth, extraClassName, 'jest-social-auth')}>
      <ul className={styles.items}>
        {SOCIAL_LOGINS.map((item) => (
          <li className={classNames(styles.item, `jest-social-auth-${item.slug}`)} key={item.id}>
            <a className={classNames(styles.socialNetwork, `theme${item.slug}`)}
              href={`${item.url}?next=${window.location.pathname}`}>
              <span className={styles.socialNetworkIcon}>{item.icon}</span>
              <span className={styles.socialNetworkTitle}>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthFormSocialAuth;
