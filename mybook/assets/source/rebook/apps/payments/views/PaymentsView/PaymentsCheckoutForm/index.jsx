import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

import pluralize from 'rebook/apps/utils/text/pluralize';
import mainStyles from 'rebook/apps/base/style/main.scss';

import PaymentsCheckoutSmsForm from './PaymentsCheckoutSmsForm';
import PaymentsCheckoutCardForm from './PaymentsCheckoutCardForm';
import PaymentsCheckoutYandexForm from './PaymentsCheckoutYandexForm';
import PaymentsCheckoutPaypalForm from './PaymentsCheckoutPaypalForm';
import { paymentMethods } from '../constants';
import styles from './style.scss';


const PromoCodeRestrictionWarning = (props) => {
  const { campaign, priceForUser, redeemCodeDiscountAmount, redeemCodeDiscountPercent } = props;

  return (
    <React.Fragment>
      {redeemCodeDiscountAmount === null && (
        <div className={classNames(mainStyles.billetContainerWarning, styles.discount)}>
          <div className={styles.discountIcon}>😱</div>
          <div>
            {campaign.min_amount_order > 0 && priceForUser < campaign.min_amount_order
              ? (
                <small>
                  Этот промо-код может быть применен,
                  только если сумма вашего заказа более {campaign.min_amount_order} ₽
                </small>
              )
              : (
                <small>
                  Код на скидку не применяется к выбранным параметрам, но вы все равно можете оплатить заказ
                </small>
              )
            }
          </div>
        </div>
      )}
      {redeemCodeDiscountPercent !== null
        && campaign.max_percent_discount > 0
        && campaign.discount_type === 'percent'
        && campaign.discount > redeemCodeDiscountPercent
        // the user's personal discount does not match the campaign percent number
        // because there is a discount limit calculated for all discount sources (such as advert campaign)
        && (
          <small className={styles.maxDiscount}>Максимальная скидка {campaign.max_percent_discount}%</small>
        )}
    </React.Fragment>
  );
};

const PaymentsCheckoutForm = ({ payments }) => {
  const {
    redeemCode, userPrice, subscriptionType, subscriptionPeriod, paymentMethod, isAutoRebill,
  } = payments;
  const subscriptionTypes = {
    standard: 'Стандартная подписка',
    pro: 'Премиум-подписка',
  };
  const monthCount = parseInt(subscriptionPeriod, 10);

  const checkoutMethodForms = {
    [paymentMethods.card.slug]: (props) => <PaymentsCheckoutCardForm {...props} />,
    [paymentMethods.sms.slug]: (props) => <PaymentsCheckoutSmsForm {...props} />,
    [paymentMethods.yandex.slug]: (props) => <PaymentsCheckoutYandexForm {...props} />,
    [paymentMethods.paypal.slug]: (props) => <PaymentsCheckoutPaypalForm {...props} />,
  };

  return (
    <div className={mainStyles.billetContainer}>
      <h2>Вы покупаете</h2>
      <div className={styles.priceSection}>
        <div className={styles.subscriptionType}>
          {subscriptionTypes[subscriptionType]}, {monthCount}&nbsp;{pluralize(monthCount, 'месяц', 'месяца', 'месяцев')}
        </div>
        <span className={styles.advertPrice}>{userPrice.fullPrice} ₽</span>
      </div>
      {userPrice.discountAmount > 0 && (
        <div className={styles.priceSection}>
          <span className={styles.subscriptionType}>Скидка</span>
          <span className={styles.advertPrice}>{userPrice.discountAmount} ₽</span>
        </div>
      )}
      <div>
        <div className={styles.total}>Итого к оплате:</div>
        <div className={classNames(styles.totalPrice, 'jest-payments-checkout-total-price')}>
          {userPrice.finalPrice} ₽
        </div>
      </div>
      <div>
        {checkoutMethodForms[paymentMethod]({ priceForUser: userPrice.finalPrice })}
      </div>
      {redeemCode.campaign && (
        <PromoCodeRestrictionWarning
          campaign={redeemCode.campaign}
          priceForUser={userPrice.advertPrice}
          redeemCodeDiscountAmount={userPrice.redeemCodeDiscountAmount}
          redeemCodeDiscountPercent={userPrice.redeemCodeDiscountPercent} />
      )}
      <div>
        {isAutoRebill && (
          <p className={styles.description}>
            В конце срока подписка продлится автоматически,
            и с вашего счета спишется стоимость следующего периода.
            Вы можете в любой момент отменить автопродление в настройках вашего профиля.
          </p>
        )}
        <p className={styles.description}>
          Оплачивая подписку, я принимаю <Link to="/about/offer/#a4">условия оплаты, указанные в оферте</Link>
          {isAutoRebill && (
            <span>
              , и <Link to="/about/offer/#a4.4">условия автоматического продления подписки на месяц вперед</Link>
            </span>
          )}.
        </p>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(PaymentsCheckoutForm);
