import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormattedDateTime from 'rebook/apps/base/components/FormattedDateTime';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


const SubscriptionActiveTill = ({ date, extraClassName }) => {
  return (
    <div className={classNames(
      mainStyles.billetContainerContent,
      styles.subscriptionActiveTill,
      extraClassName,
    )}>
      <div>
        Подписка активна до&nbsp;<FormattedDateTime timestamp={date} format="D MMMM YYYY" noWrap />
      </div>
    </div>
  );
};

SubscriptionActiveTill.propTypes = {
  date: PropTypes.string.isRequired,
  extraClassName: PropTypes.string,
};

export default SubscriptionActiveTill;
