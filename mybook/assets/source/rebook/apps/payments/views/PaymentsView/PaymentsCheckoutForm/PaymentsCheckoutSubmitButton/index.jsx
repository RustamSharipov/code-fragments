import React from 'react';

import Button from 'rebook/apps/base/components/Button';


const PaymentsCheckoutSubmitButton = ({ price, ...otherProps }) => (
  <Button {...otherProps}>Оплатить {`${price} ₽`}</Button>
);

export default PaymentsCheckoutSubmitButton;
