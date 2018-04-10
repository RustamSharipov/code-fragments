import PropTypes from 'prop-types';

import formatPaymentMethodName from 'rebook/apps/payments/utils/formatPaymentMethodName';


const PaymentMethodName = ({ slug, description }) => {
  return formatPaymentMethodName(slug, 'nom', description);
};

PaymentMethodName.propTypes = {
  slug: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default PaymentMethodName;
