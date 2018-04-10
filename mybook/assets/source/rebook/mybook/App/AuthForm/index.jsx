import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import validateForm from 'rebook/apps/base/components/form/validateForm';
import { USERS_AUTH_LOGIN_NOTIFICATIONS } from 'rebook/apps/users/constants';
import * as UserActions from 'rebook/apps/users/actions/UserActions';
import * as AuthFormActions from 'rebook/apps/users/actions/AuthFormActions';
import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';

import AuthLoginForm from './AuthLoginForm';
import AuthRegistrationForm from './AuthRegistrationForm';


class AuthForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.type || 'login',
      form: {},
      errorList: {},
      isInProgress: false,
      isSuccess: false,
    };
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  handleFormSubmit(submit) {
    this.setState({
      errorList: {},
      isInProgress: true,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  updateFormField(input) {
    // Update form state with input value and properties
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

  handleSuccess() {
    const {
      UserActions, NotificationActions, AuthFormActions,
      onSuccessAuth, noScrollToTop, noSuccessNotification,
    } = this.props;

    UserActions.fetchCurrentUser(() => {
      if (!noScrollToTop) {
        window.scrollTo(0, 0);
      };

      if (!noSuccessNotification) {
        NotificationActions.pop(USERS_AUTH_LOGIN_NOTIFICATIONS.SUCCESS);
      }

      AuthFormActions.hideForm();

      if (onSuccessAuth) {
        onSuccessAuth();
      };

      this.setState({
        errorList: {},
        isInProgress: false,
        isSuccess: true,
      });
    });
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
      isSuccess: false,
    });
  }

  handleChangeFormType(type) {
    this.setState({
      type: type,
      errorList: {},
    });
  }

  render() {
    const formTypes = {
      login: 'Вход',
      registration: 'Регистрация',
    };
    const { form, isInProgress, errorList, type } = this.state;
    const { hideTitle, submitButtonText, displaySocialAuth } = this.props;
    const authFormProps = {
      onInit: (input) => this.updateFormField(input),
      onChange: (input) => this.updateFormField(input),
      onSubmit: (callback) => this.handleFormSubmit(callback),
      onSuccess: () => this.handleSuccess(),
      onError: (errorList) => this.handleError(errorList),
      form,
      isInProgress,
      errorList,
      submitButtonText,
      displaySocialAuth,
    };

    return (
      <div>
        {!hideTitle && <div className="title-1">{formTypes[type]}</div>}
        {type === 'login' && (
          <AuthLoginForm
            handleChangeFormType={() => this.handleChangeFormType('registration')}
            {...authFormProps} />
        )}
        {type === 'registration' && (
          <AuthRegistrationForm
            handleChangeFormType={() => this.handleChangeFormType('login')}
            {...authFormProps} />
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    UserActions: bindActionCreators(UserActions, dispatch),
    AuthFormActions: bindActionCreators(AuthFormActions, dispatch),
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(AuthForm);
