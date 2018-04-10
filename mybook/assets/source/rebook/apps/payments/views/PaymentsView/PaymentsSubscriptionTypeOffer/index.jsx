import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import Button from 'rebook/apps/base/components/Button';
import { StandardIcon, PremiumIcon } from 'rebook/apps/base/components/icons/BtnIcon';
import { SUBSCRIPTION_TYPES } from 'rebook/apps/payments/constants';
import SubscriptionActiveTill from 'rebook/apps/payments/components/SubscriptionActiveTill';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


const subscriptionIcons = {
  standard: (
    <StandardIcon
      extraClassName={styles.image}
      width="64"
      height="64" />
  ),
  pro: (
    <PremiumIcon
      extraClassName={styles.image}
      width="64"
      height="64" />
  ),
};

const PaymentsSubscriptionTypeOffer = (props) => {
  const { onSubscriptionTypeChange, type, payments } = props;
  const { subscriptionTypes } = payments;
  const { userActiveTill, price, description } = subscriptionTypes[type];
  const hasProSubscription = subscriptionTypes.pro.userIsActive;
  const hasStandardSubscription = subscriptionTypes.standard.userIsActive;
  const subscriptionTypeTitle = SUBSCRIPTION_TYPES[type.toUpperCase()].NOM;

  return (
    <div
      className={classNames(styles.paymentSubscriptionType, `jest-payments-${type}-subscription-type`)}
      onClick={() => onSubscriptionTypeChange(type)}>
      <div className={classNames(
        mainStyles.billetContainerContent,
        styles.subscriptionTypeDetail,
        type === 'pro' ? 'themePro' : 'themeStandard',
      )}>
        <div className={styles.icon}>
          {subscriptionIcons[type]}
        </div>
        <div className="title-3">{subscriptionTypeTitle}</div>
        <p dangerouslySetInnerHTML={{ __html: description }} />
        {type === 'standard' && hasProSubscription && !hasStandardSubscription && (
          <small>Так как у вас есть премиум, вам доступны все книги из стандарта.</small>
        )}
      </div>
      {(type === 'pro' && hasStandardSubscription && !userActiveTill) && (
        <div className={classNames(mainStyles.billetContainerContent, styles.upgradeStandardSubscription)}>
          <span>Купить со скидкой за Стандарт</span>
        </div>
      )}
      {userActiveTill && !(type === 'standard' && hasProSubscription && !hasStandardSubscription) && (
        <SubscriptionActiveTill date={userActiveTill} extraClassName={`jest-payments-${type}-subscription-till-date`} />
      )}
      <div className={mainStyles.billetContainerFooter}>
        <div className={styles.toolbox}>
          <Button extraClassName={styles.subscriptionButton}>
            Купить от {`${price} ₽`} в месяц
          </Button>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(PaymentsSubscriptionTypeOffer);
