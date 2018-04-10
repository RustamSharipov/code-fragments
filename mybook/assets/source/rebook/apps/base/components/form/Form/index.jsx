import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';
import ERROR_MESSAGES from 'rebook/apps/base/components/form/constants';
import fetchQuery from 'rebook/apps/utils/fetchQuery';

import styles from './style.scss';


class Form extends React.Component {
  constructor(props) {
    super(props);
    this.isLocked = false;
  }

  componentWillReceiveProps({ submitOnInit }) {
    if (!this.props.submitOnInit && submitOnInit) {
      this.handleSubmit();
    }
  }

  toggleLocked(isDisabled) {
    this.isLocked = isDisabled;
  }

  handleValidationErrors(errorList={}) {
    const { onError } = this.props;

    if (onError) {
      onError(errorList);
    }
  }

  submitForm(action, method, json) {
    const { fetchParams, onSuccess } = this.props;
    const params = {
      method,
      json,
      ...fetchParams,
    };

    this.toggleLocked(true);

    fetchQuery(action, params)
      .then(
        ({ data }) => {
          if (onSuccess) {
            onSuccess(data);
          }
          this.toggleLocked(false);
        }
      )
      .catch(
        ({ data, resp }) => {
          const messages = data || {};

          // Add 'valid' errors to error list
          if (resp.status === 400) {
            this.handleValidationErrors(messages);
          }

          // display a global error for unauthorized request
          else if (resp.status === 401) {
            this.props.NotificationActions.pop(ERROR_MESSAGES.UNAUTHORIZED_REQUEST, 'error');
            this.handleValidationErrors();
          }

          // display a global error upon internal server error to error list
          else {
            this.props.NotificationActions.pop(ERROR_MESSAGES.SERVER_ERROR, 'error');
            this.handleValidationErrors();
            Raven.captureMessage('failed to submit gift code due to server error', {
              level: 'error',
              extra: {
                status: resp.status,
                content: data,
              },
            });
          }

          this.toggleLocked(false);
        }
      );
  }

  handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const { action, onSubmit, preparePayload } = this.props;

    if (onSubmit) {
      onSubmit(
        (form) => {
          const method = this.props.method || 'post';
          let payload = {};

          // Check form validity (if it has errors)
          const formIsValid = !form.errorList || Object.keys(form.errorList).length === 0;

          // Submit valid form
          if (formIsValid) {
            // Get payload data from whole form data
            Object.keys(form).forEach(
              (key) => {
                payload[key] = form[key].value;
              }
            );

            // allow the external component to insert extra data into the payload
            if (preparePayload) {
              payload = preparePayload(payload);
            }

            // Submit form if it could be submitted
            if (!this.isLocked) {
              this.submitForm(action, method, payload);
            }
          }

          // Show validation errors
          else {
            this.handleValidationErrors(form.errorList);
          }
        }
      );
    }
  }

  render() {
    const { children, extraClassName } = this.props;

    return (
      <div className={styles.form}>
        <form
          className={extraClassName}
          onSubmit={(event) => this.handleSubmit(event)}>
          {children}
        </form>
      </div>
    );
  }
}

export const FormRow = ({ children, extraClassName }) => {
  return(
    <div className={classNames(styles.formRow, extraClassName)}>
      {children}
    </div>
  );
};

export const FormControl = ({ children, extraClassName }) => {
  return(
    <div className={classNames(styles.formControl, extraClassName)}>
      {children}
    </div>
  );
};

export const FormExtra = ({ children, extraClassName }) => {
  return(
    <div className={classNames(styles.formExtra, extraClassName)}>
      {children}
    </div>
  );
};

Form.propTypes = {
  action: PropTypes.string.isRequired,
  extraClassName: PropTypes.string,
  method: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  preparePayload: PropTypes.func,
};

FormRow.propTypes = {
  extraClassName: PropTypes.string,
};

FormControl.propTypes = {
  extraClassName: PropTypes.string,
};

FormExtra.propTypes = {
  extraClassName: PropTypes.string,
};

function mapDispatchToProps(dispatch) {
  return {
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps, null, { withRef: true })(Form);
