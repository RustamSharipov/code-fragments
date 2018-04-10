import React from 'react';


class PaymentsCheckoutBaseForm extends React.Component {
  preparePostData(formPayload) {
    const {
      paymentMethod, subscriptionType, subscriptionPeriod,
      isAutoRebill, redeemCode, isGift,
    } = this.props.payments;
    let extraPaymentData = {};

    // support sms payment
    if (formPayload.sms_phone) {
      extraPaymentData.sms_phone = formPayload.sms_phone;
    }

    // add redeem code to the payload in case it was activated
    if (redeemCode.campaign) {
      extraPaymentData.redeem_code = redeemCode.code;
    }

    return {
      provider: 'web',
      data: {
        payment_method: paymentMethod,
        sub_months: subscriptionPeriod,
        sub_type: subscriptionType,
        auto_rebill: isAutoRebill,
        gift: isGift,
        ...extraPaymentData,
      },
    };
  }
};

export default PaymentsCheckoutBaseForm;
