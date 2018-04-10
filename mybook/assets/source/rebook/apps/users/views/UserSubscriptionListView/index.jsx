import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';

import Button from 'rebook/apps/base/components/Button';
import UserSettingsHeader from 'rebook/apps/users/components/UserSettingsHeader';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import mainStyles from 'rebook/apps/base/style/main.scss';

import UserSubscriptionListSubscriptionData from './UserSubscriptionListSubscriptionData';
import styles from './style.scss';


class UserSubscriptionListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subscriptionList: null,
    };
  }

  fetchWallets() {
    const { user } = this.props;
    if (!user) {
      this.setState({ subscriptionList: null });
      return;
    }

    fetchQuery('/api/wallets/')
      .then(
        ({ data }) => {
          let subscriptionList = [];

          // Add wallets data from wallets list sorted by subscription type
          let wallets = {
            standard: [],
            pro: [],
          };
          data.objects.forEach((item) => {
            wallets[item.subscription_type].push(item);
          });

          // Has standard subscription and:
          const hasStandardSubscription = user.subscription_standard_active_till && (
            // user has any rebill wallet
            wallets.standard.length > 0 ||

            // standard subscription period is longer than pro
            moment(user.subscription_standard_active_till) > moment(user.subscription_pro_active_till)
          );

          // Has premium subscription
          const hasProSubscription = !!user.subscription_pro_active_till;

          if (hasProSubscription) {
            subscriptionList.push({
              id: 2,
              activeTill: user.subscription_pro_active_till,
              type: 'pro',
              wallets: wallets.pro,
              hasAutorebillWallets: wallets.pro.filter((item) => item.is_deactivatable).length > 0,
            });
          }

          if (hasStandardSubscription) {
            subscriptionList.push({
              id: 1,
              activeTill: user.subscription_standard_active_till,
              type: 'standard',
              wallets: wallets.standard,
              hasAutorebillWallets: wallets.standard.filter((item) => item.is_deactivatable).length > 0,
            });
          }

          this.setState({ subscriptionList });
        }
      );
  }

  removeWallet(walletId) {
    let subscriptionList = [];
    this.state.subscriptionList.forEach((item) => {
      let subscription = item;
      subscription.wallets = item.wallets.filter((wallet) => wallet.id !== walletId);
      subscriptionList.push(subscription);
    });

    this.setState({ subscriptionList });
  }

  componentDidMount() {
    this.fetchWallets();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.fetchWallets();
    }
  }

  render() {
    const { subscriptionList } = this.state;
    const hasAutorebillDescription = subscriptionList && subscriptionList.filter(
      (item) => item.hasAutorebillWallets
    ).length > 0;

    return (
      <div className={classNames(
        mainStyles.backgroundContainer,
        'themeGrey',
        subscriptionList && subscriptionList.length === 0 && styles.emptySubscriptionList,
      )}>
        <div className="gridColumn cols-6">
          <UserSettingsHeader page="userSubscriptionList" />
          {subscriptionList
            ? (
              <React.Fragment>
                <div className="jest-subscription-list">
                  {subscriptionList.length > 0
                    ? (
                      subscriptionList.map((item) => (
                        <UserSubscriptionListSubscriptionData
                          {...item}
                          onDeactivateWallet={(walletId) => this.removeWallet(walletId)}
                          key={item.id} />
                      ))
                    )
                    : (
                      <div className={styles.emptySubscriptionListContent}>
                        <div className="title-2">У вас нет подписки, и самое время ее подключить</div>
                        <div className={styles.emptySubscriptionListLinks}>
                          <Button link="/payments/" extraClassName={styles.emptySubscriptionListLink}>
                            Оформить подписку
                          </Button>
                        </div>
                      </div>
                    )
                  }
                </div>
                {hasAutorebillDescription && (
                  <div className={styles.autoRebillingNote}>
                    <p>
                      <small>
                        При отключении автопродления ваша подписка будет активна в течении всего оплаченного времени,
                        и отключится, когда оно кончится.
                      </small>
                    </p>
                    <p>
                      <small>
                        Если вы активировали подарочный код, он начнет действовать после окончания
                        вашей текущей подписки.
                      </small>
                    </p>
                  </div>
                )}
              </React.Fragment>
            )
            : (
              [...Array(2)].map((item, i) => (
                <div className={mainStyles.billetContainer} key={i + 1}>
                  <div className="title-1 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                </div>
              ))
            )
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserSubscriptionListView);
