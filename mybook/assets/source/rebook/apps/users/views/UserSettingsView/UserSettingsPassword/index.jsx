import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';
import * as UserActions from 'rebook/apps/users/actions/UserActions';
import Form, { FormRow, FormControl } from 'rebook/apps/base/components/form/Form';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import Button from 'rebook/apps/base/components/Button';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import { USER_SETTINGS_SUCCESS_MESSAGES, USER_SETTINGS_ERROR_MESSAGES } from 'rebook/apps/users/constants';
import mainStyles from 'rebook/apps/base/style/main.scss';


class UserSettingsPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      errorList: {},
      isDisabled: false,
      isInProgress: false,
    };
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  updateFormField(input) {
    this.setState(
      (prevState) => {
        return {
          errorList: {},
          form: {
            ...prevState.form,
            ...input,
          },
        };
      }
    );
  }

  handleSubmit(submit) {
    this.setState({
      errorList: {},
      isInProgress: true,
    });

    const form = validateForm(this.state.form);
    submit(form);
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
    });

    if (errorList.non_field_errors) {
      this.props.NotificationActions.pop(errorList.non_field_errors, 'error');
    }
  }

  handleSuccess(data) {
    this.setState({
      errorList: {},
      isInProgress: false,
    });
    this.props.NotificationActions.pop(USER_SETTINGS_SUCCESS_MESSAGES.USER_PASSWORD_UPDATED, 'success');
    this.props.UserActions.fetchCurrentUser();
  }

  render() {
    const { errorList, isDisabled, isInProgress } = this.state;
    return (
      <div className={mainStyles.billetContainer}>
        <div className="title-2">Изменить пароль</div>
        <Form
          action="/api/change-password/"
          fetchParams={{ apiVersion: 4 }}
          extraClassName="jest-changepassword-form"
          onSubmit={(callback) => this.handleSubmit(callback)}
          onSuccess={(data) => this.handleSuccess(data)}
          onError={(errorList) => this.handleError(errorList)}>
          <FormRow>
            <FormTextInput
              type="password"
              extraClassName="jest-changepassword-oldpassword"
              validationMessageExtraClassName="jest-changepassword-oldpassword-error"
              errorList={errorList.old_password}
              isDisabled={isDisabled || isInProgress}
              isRequired
              isRequiredError={USER_SETTINGS_ERROR_MESSAGES.PASSWORD_IS_REQUIRED}
              label="Старый пароль"
              onUpdate={(input) => this.updateFormField(input)}
              name="old_password" />
          </FormRow>
          <FormRow>
            <FormTextInput
              type="password"
              extraClassName="jest-changepassword-newpassword"
              validationMessageExtraClassName="jest-changepassword-newpassword-error"
              errorList={errorList.new_password}
              isDisabled={isDisabled || isInProgress}
              isRequired
              isRequiredError={USER_SETTINGS_ERROR_MESSAGES.PASSWORD_IS_REQUIRED}
              label="Новый пароль"
              onUpdate={(input) => this.updateFormField(input)}
              name="new_password" />
          </FormRow>
          <FormControl>
            <Button
              type="submit"
              extraClassName="jest-changepassword-form-submit"
              theme="secondary"
              size="small"
              isInProgress={isInProgress}>
              Изменить
            </Button>
          </FormControl>
        </Form>
      </div>
    );
  }
}

UserSettingsPassword.propTypes = {
  user: PropTypes.shape({
    new_password: PropTypes.string,
    old_password: PropTypes.string,
  }),
};

function mapDispatchToProps(dispatch) {
  return {
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
    UserActions: bindActionCreators(UserActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UserSettingsPassword);
