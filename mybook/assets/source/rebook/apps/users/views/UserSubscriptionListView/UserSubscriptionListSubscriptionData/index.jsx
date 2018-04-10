import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import * as ModalDialogActions from 'rebook/apps/base/actions/ModalDialogActions';
import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';
import SubscriptionActiveTill from 'rebook/apps/payments/components/SubscriptionActiveTill';
import SubscriptionTypeTitle from 'rebook/apps/payments/components/SubscriptionTypeTitle';
import PaymentMethodIcon from 'rebook/apps/payments/components/PaymentMethodIcon';
import PaymentMethodName from 'rebook/apps/payments/components/PaymentMethodName';
import { TableListItem, TableListItemIcon, TableListItemTitle, TableListItemContent }
  from 'rebook/apps/base/components/TableListItem';
import FormattedDateTime from 'rebook/apps/base/components/FormattedDateTime';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import formatPaymentMethodName from 'rebook/apps/payments/utils/formatPaymentMethodName';
import ERROR_MESSAGES from 'rebook/apps/base/components/form/constants';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


const DeactivateAutoRebillDialogContent = () => {
  return (
    <p>
      Вы уверены, что хотите отключить автопродление? Если у вас не останется ни одного активного
      автопродления, после окончания оплаченного периода вы потеряете доступ к каталогу MyBook.
    </p>
  );
};

class UserSubscriptionListSubscriptionData extends React.Component {
  constructor(props) {
    super(props);
    this.walletDeactivationIsLocked = false;
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  toggleWalletDeactivationLock(isLocked) {
    this.walletDeactivationIsLocked = isLocked;
  }

  showDeactivateWalletDialog(wallet) {
    if (this.walletDeactivationIsLocked) {
      return null;
    }

    const { ModalDialogActions } = this.props;
    ModalDialogActions.pop({
      title: 'Отключение автопродления',
      emojiIcon: '😢',
      extraClassName: 'jest-deactivate-rebilling-dialog',
      content: <DeactivateAutoRebillDialogContent />,
      actions: [
        {
          id: 1,
          content: 'Да',
          extraClassName: 'link jest-deactivate-rebilling-dialog-accept',
          onClick: () => this.deactivateWallet(wallet),
        },
        {
          id: 2,
          content: 'Нет',
          extraClassName: 'jest-deactivate-rebilling-dialog-decline',
        },
      ],
    });
  }

  deactivateWallet(wallet) {
    const { NotificationActions, onDeactivateWallet } = this.props;
    this.toggleWalletDeactivationLock(true);

    fetchQuery(`/api/wallets/${wallet.id}/deactivate/`, { method: 'POST' })
      .then(
        () => {
          this.toggleWalletDeactivationLock(false);
          const methodName = formatPaymentMethodName(wallet.slug, 'gen');
          NotificationActions.pop(`Автопродление для ${methodName} отключено`, 'done');

          if (onDeactivateWallet) {
            onDeactivateWallet(wallet.id);
          }
        }
      )
      .catch(
        ({ resp, data }) => {
          this.toggleWalletDeactivationLock(false);
          if (resp.status === 500) {
            NotificationActions.pop(ERROR_MESSAGES.SERVER_ERROR, 'error');
            Raven.captureMessage('failed to deactivate wallet due to server error', {
              level: 'error',
              extra: {
                status: resp.status,
                content: data,
              },
            });
          }
        }
      );
  }

  render() {
    const { activeTill, type, wallets } = this.props;
    return (
      <div className={classNames('jest-subscription-data', `jest-subscription-data-${type}`)}>
        <SubscriptionTypeTitle
          subscriptionType={type}
          extraClassName={mainStyles.billetContainerHeader} />
        <SubscriptionActiveTill date={activeTill} />
        {wallets.length > 0 && (
          <div className={mainStyles.billetContainerContent}>
            {wallets.map(
              (item) => (
                <TableListItem key={item.id}>
                  <TableListItemIcon>
                    <PaymentMethodIcon slug={item.slug} />
                  </TableListItemIcon>
                  {item.next_rebill_date && (
                    <TableListItemTitle>
                      <div>
                        Следующее списание{' '}
                        <FormattedDateTime timestamp={item.next_rebill_date} format="D MMMM YYYY" noWrap />
                      </div>
                    </TableListItemTitle>
                  )}
                  <TableListItemContent>
                    <PaymentMethodName slug={item.slug} description={item.safe_wallet_num} />
                  </TableListItemContent>
                  {item.slug === 'itunes' && !item.is_deactivatable
                    ? (
                      <div>
                        <small>
                          У вас есть подписка, оформленная через {formatPaymentMethodName(item.slug, 'acc')},
                          а значит, если вы захотите купить подписку на сайте, вам нужно заранее ее отключить,
                          иначе с вас спишут деньги два раза.
                        </small>
                        <div className={styles.subscriptionStatus}>
                          <Link
                            to="/help/biblioteka-dlya-ios-mybook/kak-otmenit-podpisku-oformlennuyu-na-ustrojstve-io/"
                            className="link jest-deactivate-ios">
                            Как отключить?
                          </Link>
                        </div>
                      </div>
                    )
                    : (
                      <div className={styles.subscriptionStatus}>
                        <span
                          className={classNames('link', `jest-deactivate-rebilling-${item.id}`)}
                          onClick={() => this.showDeactivateWalletDialog(item)}>
                          Отключить автопродление*
                        </span>
                      </div>
                    )
                  }
                </TableListItem>
              )
            )}
          </div>
        )}
      </div>
    );
  }
}

UserSubscriptionListSubscriptionData.propTypes = {
  activeTill: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  wallets: PropTypes.arrayOf(
    PropTypes.shape({
      is_deactivatable: PropTypes.bool,
      next_rebill_date: PropTypes.string,
      safe_wallet_num: PropTypes.string,
      slug: PropTypes.string,
    })
  ),
};

function mapDispatchToProps(dispatch) {
  return {
    ModalDialogActions: bindActionCreators(ModalDialogActions, dispatch),
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UserSubscriptionListSubscriptionData);
