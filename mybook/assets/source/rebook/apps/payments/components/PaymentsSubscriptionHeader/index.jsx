import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import ActiveUserSubscriptionInfo from 'rebook/apps/payments/components/ActiveUserSubscriptionInfo';
import { SUBSCRIPTION_TYPES } from 'rebook/apps/payments/constants';
import PaymentsHeader from 'rebook/apps/payments/components/PaymentsHeader';

import styles from './style.scss';


const PaymentsSubscriptionHeader = (props) => {
  const { type, isGift, userEmail, payments } = props;
  const subscriptionInfo = payments.subscriptionTypes[type];

  let subscriptionTypeTitle = `Оформление ${SUBSCRIPTION_TYPES[type.toUpperCase()].GEN}`;

  if (isGift) {
    subscriptionTypeTitle = `${subscriptionTypeTitle} в подарок`;
  }

  return (
    <PaymentsHeader title={subscriptionTypeTitle} isGift={isGift} subscriptionType={type}>
      {isGift
        ? (
          <div className={styles.description}>
            <p>
              После покупки подписки вы получите код и&nbsp;подарочный сертификат, который придет вам
              на&nbsp;почту <strong>{userEmail}</strong>.
            </p>
            <p>
              Передайте код вашему другу или близкому. Он сможет активировать код на сайте или
              в&nbsp;приложении и&nbsp;читать.
            </p>
          </div>
        )
        : (
          subscriptionInfo.userActiveTill
            ? (
              <div className={styles.userSubscription}>
                <ActiveUserSubscriptionInfo {...props} extraClassName="jest-payments-user-subscription-detail" />
              </div>
            )
            : (
              <div className={classNames(styles.description, `jest-payments-subscription-header-description`)}>
                <p dangerouslySetInnerHTML={{ __html: subscriptionInfo.description }} />
              </div>
            )
        )
      }
    </PaymentsHeader>
  );
};

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(PaymentsSubscriptionHeader);
