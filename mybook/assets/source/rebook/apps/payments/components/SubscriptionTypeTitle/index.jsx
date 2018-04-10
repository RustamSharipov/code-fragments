import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { StandardIcon, PremiumIcon } from 'rebook/apps/base/components/icons/BtnIcon';
import { SUBSCRIPTION_TYPES } from 'rebook/apps/payments/constants';

import styles from './style.scss';


const SubscriptionTypeTitle = ({ subscriptionType, hasGift, extraClassName }) => {
  let subscriptionTypeTitle = SUBSCRIPTION_TYPES[subscriptionType.toUpperCase()].NOM;

  if (hasGift) {
    subscriptionTypeTitle = `${subscriptionTypeTitle} в&nbsp;подарок`;
  }

  return (
    <div className={classNames(
      extraClassName,
      styles.subscriptionType,
      subscriptionType === 'pro' ? 'themePremium' : 'themeStandard',
    )}>
      <div className={styles.subscriptionType}>
        <div className="title-2" dangerouslySetInnerHTML={{ __html: subscriptionTypeTitle }} />
      </div>
      <div className={styles.subscriptionTypeIcon}>
        {subscriptionType === 'pro'
          ? <PremiumIcon width="32" height="32" extraClassName={styles.subscriptionTypeIconImage} />
          : <StandardIcon width="32" height="32" extraClassName={styles.subscriptionTypeIconImage} />
        }
        {hasGift &&
          <span className={styles.subscriptionTypeIconGift} />
        }
      </div>
    </div>
  );
};

SubscriptionTypeTitle.defaultProps = {
  hasGift: false,
  subscriptionType: 'standard',
};

SubscriptionTypeTitle.propTypes = {
  extraClassName: PropTypes.string,
  hasGift: PropTypes.bool,
  subscriptionType: PropTypes.string.isRequired,
};

export default SubscriptionTypeTitle;
