import React from 'react';
import PropTypes from 'prop-types';

import fetchQuery from 'rebook/apps/utils/fetchQuery';


class CheckPaymentStatus extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.checkStatusInterval = 5 * 1000; // poll for payment status this every seconds
  }

  componentDidMount() {
    this.delayCheckStatus();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  delayCheckStatus() {
    this.timer = setTimeout(() => this.checkStatus(), this.checkStatusInterval);
  }

  checkStatus() {
    const { paymentUuid, onSuccess, onFail } = this.props;

    fetchQuery(`/api/payments/${paymentUuid}/`)
      .then(
        ({ data }) => {
          if (data.status === 'accepted') {
            onSuccess(data);
          }
          else if (data.status === 'failed' || data.status === 'declined') {
            onFail(data);
          }
          else if (data.status === 'new' || data.status === 'pending') {
            // continue polling
            this.delayCheckStatus();
          }
        }
      )
      .catch(
        ({ data, resp }) => {
          onFail();
          Raven.captureMessage('failed to check payment status due to server error', {
            level: 'error',
            extra: {
              paymentUuid: paymentUuid,
              status: resp ? resp.status : null,
              response: data,
            },
          });
        }
      );
  }

  render() {
    return null;
  }
}

CheckPaymentStatus.propTypes = {
  paymentUuid: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFail: PropTypes.func.isRequired,
};

export default CheckPaymentStatus;
