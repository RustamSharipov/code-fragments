import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { StandardIcon, PremiumIcon } from 'rebook/apps/base/components/icons/BtnIcon';

import styles from './style.scss';


const subscriptionIcons = {
  standard: (
    <StandardIcon
      extraClassName={styles.iconImage}
      width="144"
      height="144" />
  ),
  pro: (
    <PremiumIcon
      extraClassName={styles.iconImage}
      width="144"
      height="144" />
  ),
};

const PaymentsHeader = (props) => {
  const { children, title, isGift, subscriptionType } = props;
  return (
    <div className={styles.paymentsSubscriptionHeader}>
      <div className={classNames(styles.title, 'title-1')} dangerouslySetInnerHTML={{ __html: title }} />
      <div className={classNames(
        styles.icon,
        isGift && 'hasGift',
      )}>
        {subscriptionIcons[subscriptionType]}
      </div>
      <div className={styles.userSubscription}>
        {children}
      </div>
    </div>
  );
};

PaymentsHeader.propTypes = {
  title: PropTypes.string.isRequired,
  isGift: PropTypes.object,
  subscriptionType: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};

export default PaymentsHeader;
