import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

import SpinnerLoader from 'rebook/apps/base/components/SpinnerLoader';
import * as PaymentsActions from 'rebook/apps/payments/actions/PaymentsActions';
import * as UserWalletsActions from 'rebook/apps/users/actions/UserWalletsActions';
import mainStyles from 'rebook/apps/base/style/main.scss';
import PaymentsSubscriptionHeader from 'rebook/apps/payments/components/PaymentsSubscriptionHeader';

import PaymentsSubscriptionTypeOffer from './PaymentsSubscriptionTypeOffer';
import PaymentsSubscription from './PaymentsSubscription';
import PaymentsFAQ from './PaymentsFAQ';
import PaymentsGiftSubscription from './PaymentsGiftSubscription';
import styles from './style.scss';


class PaymentsView extends React.Component {
  componentWillMount() {
    // this method is called both server side and client side
    // we have to fill subscription types details with basic info such as 1 month price
    // so it can be properly rendered server side
    const { PaymentsActions } = this.props;
    PaymentsActions.updateSubscriptionTypes();
  }

  componentDidMount() {
    // unlike componentWillMount this method is called client side only
    // user wallets should be fetched client side only
    // same goes for initial data and redeem code restore
    const { UserWalletsActions, PaymentsActions, user } = this.props;
    PaymentsActions.fetchInitialData(this.props.history);
    PaymentsActions.restoreRedeemCode(this.props.history);

    if (user) {
      UserWalletsActions.fetchWallets();
    }
  }

  componentDidUpdate(prevProps) {
    const { history, location, PaymentsActions, UserWalletsActions, user, userWallets } = this.props;
    const { prices } = this.props.payments;

    // change prices once user logs in or logs out
    if (user !== prevProps.user) {
      PaymentsActions.restoreRedeemCode(history);
      PaymentsActions.fetchPrices();

      if (user) {
        UserWalletsActions.fetchWallets();
      }
    }

    if (user !== prevProps.user || prices !== prevProps.payments.prices || userWallets !== prevProps.userWallets) {
      PaymentsActions.updateSubscriptionTypes();
    }

    // update internal state when user goes back and forth in browser history
    const newLocationState = this.props.location.state || {};
    if (prevProps.location !== location) {
      PaymentsActions.updateState({
        state: {
          ...newLocationState,
          subscriptionType: newLocationState.subscriptionType || null,
          isGift: newLocationState.isGift || false,
        },
      });
    }
  }

  changeSubscriptionType(type, isGift = false) {
    const { isGift: wasGift } = this.props.payments;
    let query = {
      subscription_type: type,
    };
    if (isGift) {
      query.gift = '1';
    }
    this.props.PaymentsActions.updateState({
      state: {
        subscriptionType: type,
        isGift,
      },
      query,
      history: this.props.history,
      // push subscription type change with a new history item along with state
      // so the user is able to return to the subscription selection screen
      // either with left swipe or the back button in desktop
      isHistoryPush: true,
    });
    // prices are different for gift
    if (wasGift !== isGift) {
      this.props.PaymentsActions.fetchPrices();
    }
    this.scrollToTop();
  }

  changeSubscriptionPeriod(period) {
    this.props.PaymentsActions.updateState({
      state: {
        subscriptionPeriod: period,
      },
      history: this.props.history,
      query: {
        months: period,
      },
    });
  }

  changePaymentMethod(method) {
    this.props.PaymentsActions.updateState({
      state: {
        paymentMethod: method,
      },
      history: this.props.history,
      query: {
        method,
      },
    });
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  render() {
    const { subscriptionType, subscriptionTypes, prices, isGift } = this.props.payments;
    const userEmail = this.props.user && this.props.user.email;
    const promoCampaign = this.props.promoCampaign;

    if (!prices) {
      return (
        <div className={styles.loader}>
          <SpinnerLoader />
        </div>
      );
    }

    return (
      <div className={classNames(mainStyles.backgroundContainer, 'themeGrey')}>
        {subscriptionType
          ? (
            <React.Fragment>
              <div className={classNames(
                styles.paymentsSubscriptionHeader,
                subscriptionType === 'pro' ? 'themePro' : 'themeStandard',
                'jest-payments-subscription-header'
              )}>
                <PaymentsSubscriptionHeader
                  type={subscriptionType}
                  isGift={isGift}
                  userEmail={userEmail}
                  onChangeSubscriptionType={(type) => this.changeSubscriptionType(type)} />
              </div>
              <div className={styles.paymentsSubscription}>
                <PaymentsSubscription
                  onSubscriptionPeriodChange={(newPeriod) => this.changeSubscriptionPeriod(newPeriod)}
                  onPaymentMethodChange={(newMethod) => this.changePaymentMethod(newMethod)}
                  {...this.state} />
              </div>
            </React.Fragment>
          )
          : (
            <React.Fragment>
              <div className={styles.subscriptionList}>
                <div className={styles.subscriptionListTitle}>
                  <div className="title-2">Оформление подписки</div>
                </div>
                {promoCampaign && (
                  <p>{promoCampaign.announcement_text}</p>
                )}
                <div className="grid cols-8 jest-payments-subscription-types">
                  {Object.keys(subscriptionTypes).map((subType) => (
                    <div className="gridColumn cols-4" key={subType}>
                      <PaymentsSubscriptionTypeOffer
                        type={subType}
                        onSubscriptionTypeChange={() => this.changeSubscriptionType(subType)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="gridColumn cols-8">
                <PaymentsGiftSubscription
                  onSubscriptionTypeChange={(newType) => this.changeSubscriptionType(newType, true)} />
              </div>
              <div className="gridColumn cols-8">
                <PaymentsFAQ />
                <div className={styles.navigation} onClick={() => this.scrollToTop()}>
                  <div className={styles.navigationArrow} />
                  <p className={styles.navigationTitle}>Оформить подписку</p>
                </div>
              </div>
            </React.Fragment>
          )
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    payments: state.payments,
    userWallets: state.userWallets,
    promoCampaign: state.promoCampaign,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    PaymentsActions: bindActionCreators(PaymentsActions, dispatch),
    UserWalletsActions: bindActionCreators(UserWalletsActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentsView);
