import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { TableListItem } from 'rebook/apps/base/components/TableListItem';
import { StandardIcon, PremiumIcon } from 'rebook/apps/base/components/icons/BtnIcon';
import FormattedDateTime from 'rebook/apps/base/components/FormattedDateTime';
import { SUBSCRIPTION_TYPES } from 'rebook/apps/payments/constants';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


const subscriptionIcons = {
  standard: (
    <StandardIcon
      width="32"
      height="32" />
  ),
  pro: (
    <PremiumIcon
      width="32"
      height="32" />
  ),
};

const ActiveUserSubscriptionInfo = (props) => {
  const { type, onChangeSubscriptionType, extraClassName, payments } = props;
  const { subscriptionTypes } = payments;
  const { userWallets, userActiveTill } = subscriptionTypes[type];

  const subscriptionTypeTitle = SUBSCRIPTION_TYPES[type.toUpperCase()].NOM;
  const hasStandardSubscriptionOnly = (
    type === 'standard'
    && subscriptionTypes.standard.userIsActive
    && !subscriptionTypes.pro.userIsActive
  );
  const hasProSubscriptionOnly = (
    type === 'standard'
    && subscriptionTypes.pro.userIsActive
    && !subscriptionTypes.standard.userIsActive
  );
  const hasUndeactivatableAutoRebill = (
    userWallets
    && userWallets.length > 0
    && userWallets.filter((item) => ['google-play', 'inplat', 'itunes'].indexOf(item.slug) >= 0).length > 0
  );
  const subscriptionIcon = hasProSubscriptionOnly ? subscriptionIcons.pro : subscriptionIcons[type];

  return (
    <React.Fragment>
      <TableListItem extraClassName={classNames(mainStyles.billetContainerContent, extraClassName)}>
        <div className={styles.subscriptionDetail}>
          <div className={styles.icon}>
            {hasUndeactivatableAutoRebill
              ? <span className={styles.autoRebillWarningIcon} />
              : subscriptionIcon
            }
          </div>
          {hasUndeactivatableAutoRebill
            ? (
              <div className={styles.data}>
                <div className={classNames(styles.title, 'title-3')}>Внимание!</div>
                <div>
                  У вас уже есть активированные подписки! Возможно двойное списание денег
                  при оформлении новой подписки
                </div>
              </div>
            )
            : (
              <div className={styles.data}>
                {(userActiveTill && !hasProSubscriptionOnly) && (
                  <div className={classNames(styles.title, 'title-3')}>
                    {subscriptionTypeTitle} активна до&nbsp;
                    <FormattedDateTime timestamp={userActiveTill} format="D MMMM YYYY" noWrap />
                  </div>
                )}
                {hasProSubscriptionOnly && (
                  <div>
                    Так как у вас есть премиум, вам доступны все книги из стандарта
                  </div>
                )}
              </div>
            )
          }
        </div>
      </TableListItem>
      {userWallets && userWallets.length > 0 && (
        <div className={classNames(mainStyles.billetContainerContent, mainStyles.tableSummary)}>
          <Link
            to="/account/subscriptions/"
            className={classNames(
              mainStyles.tableSummaryLink,
              'link',
              'jest-payments-user-subscriptions-link',
            )}>
            Управление подписками
          </Link>
        </div>
      )}
      {hasStandardSubscriptionOnly && (
        <div className={classNames(mainStyles.billetContainerFooter, mainStyles.tableSummary)}>
          <span
            className={classNames(mainStyles.tableSummaryLink, 'link')}
            onClick={() => onChangeSubscriptionType('pro')}>
            Докупить до Премиума
          </span>
        </div>
      )}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(ActiveUserSubscriptionInfo);
