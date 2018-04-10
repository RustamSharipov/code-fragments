import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PaymentMethodIcon from 'rebook/apps/payments/components/PaymentMethodIcon';
import PaymentMethodName from 'rebook/apps/payments/components/PaymentMethodName';
import SubscriptionTypeTitle from 'rebook/apps/payments/components/SubscriptionTypeTitle';
import { TableListItem, TableListItemIcon, TableListItemTitle, TableListItemContent }
  from 'rebook/apps/base/components/TableListItem';
import CopyToClipboard from 'rebook/apps/base/components/CopyToClipboard';
import formatCurrency from 'rebook/apps/utils/text/formatCurrency';
import mainStyles from 'rebook/apps/base/style/main.scss';
import FormattedDateTime from 'rebook/apps/base/components/FormattedDateTime';

import styles from './style.scss';


const PaymentListPaymentData = (payment) => {
  const payedFrom = payment.pro_payed_from || payment.standard_payed_from;
  const payedTill = payment.pro_payed_till || payment.standard_payed_till;

  return (
    <div className="jest-payment-data">
      <SubscriptionTypeTitle
        subscriptionType={payment.subscription_type}
        hasGift={!!payment.gift}
        extraClassName={mainStyles.billetContainerHeader} />
      <div className={mainStyles.billetContainerContent}>
        <TableListItem>
          <TableListItemTitle>Дата оплаты</TableListItemTitle>
          <TableListItemContent>
            <FormattedDateTime timestamp={payment.created} format="D MMMM YYYY (H:mm)" />
          </TableListItemContent>
        </TableListItem>
        {payment.gift
          ? (
            <TableListItem>
              <TableListItemTitle>Подарочный код</TableListItemTitle>
              <TableListItemContent>
                <CopyToClipboard
                  extraClassName={styles.giftCode}
                  copiedClassName="isCopied"
                  copiedClassNameDuration={2 * 1000}>
                  {payment.gift.code}
                </CopyToClipboard>
              </TableListItemContent>
            </TableListItem>
          )
          : (
            <TableListItem>
              <TableListItemTitle>Период активности подписки</TableListItemTitle>
              <TableListItemContent>
                <span>
                  <FormattedDateTime timestamp={payedFrom} format="D MMMM YYYY" />&nbsp;—&nbsp;
                  <FormattedDateTime timestamp={payedTill} format="D MMMM YYYY" />
                </span>
              </TableListItemContent>
            </TableListItem>
          )
        }
        <TableListItem>
          <TableListItemIcon>
            <PaymentMethodIcon slug={payment.method.slug} />
          </TableListItemIcon>
          <TableListItemTitle>Способ оплаты</TableListItemTitle>
          <TableListItemContent>
            <PaymentMethodName
              slug={payment.method.slug}
              description={payment.wallet && payment.wallet.safe_wallet_num} />
          </TableListItemContent>
        </TableListItem>
        {payment.method.slug !== 'gift' && (
          <TableListItem>
            <TableListItemTitle>Сумма</TableListItemTitle>
            <TableListItemContent>
              {formatCurrency(payment.amount, payment.currency)}
            </TableListItemContent>
          </TableListItem>
        )}
      </div>
      {payment.receipt_ofd_link && (
        <div className={classNames(mainStyles.billetContainerFooter, mainStyles.tableSummary)}>
          <a
            href={payment.receipt_ofd_link}
            className={classNames(mainStyles.tableSummaryLink, 'link')}
            target="_blank">
            Кассовый чек
          </a>
        </div>
      )}
    </div>
  );
};

PaymentListPaymentData.propTypes = {
  amount: PropTypes.string,
  currency: PropTypes.string,
  created: PropTypes.string,
  gift: PropTypes.shape({
    code: PropTypes.string,
  }),
  method: PropTypes.shape({
    slug: PropTypes.string,
  }).isRequired,
  receipt_ofd_link: PropTypes.string,
  subscription_type: PropTypes.string.isRequired,
  wallet: PropTypes.shape({
    safe_wallet_num: PropTypes.string,
  }),
};

export default PaymentListPaymentData;
