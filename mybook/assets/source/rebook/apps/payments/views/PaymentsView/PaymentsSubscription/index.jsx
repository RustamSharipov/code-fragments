import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import pluralize from 'rebook/apps/utils/text/pluralize';
import mainStyles from 'rebook/apps/base/style/main.scss';

import PaymentsPromoCode from '../PaymentsPromoCode';
import PaymentsCheckoutForm from '../PaymentsCheckoutForm';
import { paymentMethods } from '../constants';
import styles from './style.scss';


const DiscountedSubscriptionPeriod = ({ discountedPrice, fullPrice, showDiscountSign }) => {
  return (
    <div>
      <span className={styles.advertPrice}>{discountedPrice} ₽</span>
      <span className={styles.price}><strike>{fullPrice} ₽</strike></span>
      {showDiscountSign && (
        <div className={styles.discountIcon}>%</div>
      )}
    </div>
  );
};

const NoDiscountSubscriptionPeriod = ({ priceForUser, oneMonthFullPrice, isGift }) => {
  return (
    <div>
      <span className={styles.advertPrice}>{priceForUser} ₽</span>
      {!isGift && (
        <span className={styles.price}>далее {oneMonthFullPrice} ₽/мес</span>
      )}
    </div>
  );
};

const ChooseSubscriptionPeriod = ({ payments, onSubscriptionPeriodChange }) => {
  // choose the subscription period among those returned by server
  // for selected subscription type (either "standard" or "pro")
  const { prices, subscriptionType, subscriptionPeriod, isGift } = payments;
  const oneMonthFullPrice = prices[subscriptionType]['1'].full_price;
  const subscriptionTypePrices = prices[subscriptionType];
  return (
    <div className={mainStyles.billetContainer}>
      <div className="title-2">На какой период</div>
      <div className={styles.options}>
        {Object.keys(subscriptionTypePrices).map((monthId) => {
          let {
            advert_price_for_user: priceForUser,
            full_price: fullPrice,
            redeem_code_discount: redeemCodeDiscount,
          } = subscriptionTypePrices[monthId];
          let showDiscountSign = false;
          let discountedPrice = null;
          // advertPrice is the price active for the current user,
          // it may be discounted due to global price change, redeemed promo code or due to active standard subscription
          const monthCount = parseInt(monthId, 10);
          // calculate the per month price for this period
          const periodPerMonthPriceForUser = Math.ceil(priceForUser / monthCount);

          // apply promocode discount
          if (redeemCodeDiscount) {
            priceForUser -= redeemCodeDiscount;
          }
          // the users pays less than normally users do, show the percent sign!
          if (priceForUser !== fullPrice) {
            discountedPrice = priceForUser;
            showDiscountSign = true;
          }
          // the per month price for this period is cheaper, than the one month price
          // dont show the discount sign, but display the discount the user gets
          else if (periodPerMonthPriceForUser < oneMonthFullPrice) {
            fullPrice = oneMonthFullPrice * monthCount;
            discountedPrice = priceForUser;
            showDiscountSign = false;
          }

          return (
            <div
              onClick={() => onSubscriptionPeriodChange(monthId)}
              className={classNames(styles.radioLabel, 'jest-payments-subscription-period')}
              data-jest-payments-subscription-period={monthId}
              key={monthId}>
              <div className={styles.radio}>
                <input
                  readOnly
                  type="radio"
                  value={monthId}
                  checked={subscriptionPeriod === monthId} />
                <div className={styles.radioText}>
                  <div className={styles.months}>
                    {monthId}&nbsp;{pluralize(monthCount, 'месяц', 'месяца', 'месяцев')}
                  </div>
                  {discountedPrice
                    ? (
                      <DiscountedSubscriptionPeriod
                        showDiscountSign={showDiscountSign}
                        discountedPrice={discountedPrice}
                        fullPrice={fullPrice} />
                    )
                    : (
                      <NoDiscountSubscriptionPeriod
                        isGift={isGift}
                        oneMonthFullPrice={oneMonthFullPrice}
                        priceForUser={priceForUser} />
                    )
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChoosePaymentMethod = ({ payments, onPaymentMethodChange }) => {
  const { paymentMethod, isAutoRebill, userPrice } = payments;
  return (
    <div className={mainStyles.billetContainer}>
      <div className="title-2">Способы оплаты</div>
      <div className={styles.options}>
        {Object.keys(paymentMethods).map((methodId) => {
          const method = paymentMethods[methodId];
          const iconClassName = `${methodId}Icon`;
          return (
            <div
              onClick={() => onPaymentMethodChange(method.slug)}
              className={classNames(styles.radioLabel, 'jest-payments-subscription-method')}
              data-jest-payments-subscription-method={method.slug}
              key={methodId}>
              <div className={styles.radio}>
                <input
                  readOnly
                  type="radio"
                  value={method.slug}
                  checked={paymentMethod === method.slug} />
                <div className={styles.radioText}>
                  {method.icon
                    ? (
                      <div className={styles[iconClassName]} />
                    )
                    : (
                      <div>
                        {method.title && (
                          <div className={styles.phoneMethodTitle}>{ method.title }</div>
                        )}
                        {method.description && (
                          <div className={styles.phoneMethodDescription}>{ method.description }</div>
                        )}
                      </div>
                    )
                  }
                  {userPrice.discountAmount > 0 && (
                    <div className={styles.discountIcon}>%</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isAutoRebill && (
        <p className={styles.methodsInfo}>
          В конце срока подписка продлится автоматически.
          Вы можете в любой момент отменить подписку в настройках профиля.
        </p>
      )}
    </div>
  );
};

const PaymentsSubscription = (props) => {
  return (
    <div className={classNames(styles.subscriptionsList, 'jest-payments-subscription-page')}>
      <PaymentsPromoCode />
      <ChooseSubscriptionPeriod {...props} />
      <ChoosePaymentMethod {...props} />
      <PaymentsCheckoutForm />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(PaymentsSubscription);
