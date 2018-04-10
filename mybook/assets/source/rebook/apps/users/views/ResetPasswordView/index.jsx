import React from 'react';
import classNames from 'classnames';

import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import Button from 'rebook/apps/base/components/Button';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import CountdownTimer from 'rebook/apps/base/components/CountdownTimer/index';
import mainStyles from 'rebook/apps/base/style/main.scss';
import PasswordResetFormPhone from 'rebook/apps/users/components/PasswordResetFormPhone';

import styles from './style.scss';


const ResetPasswordFormAgain = (props) => {
  const {
    nextAttemptTimeout, identifierType,
    isDisabled, isTimerActive, handleSuccess, handleFormSubmit, handleError, handleTimerFinished,
  } = props;
  const ButtonText = isTimerActive
    ? 'Выслать повторно'
    : (
      identifierType === 'email'
        ? 'Выслать письмо повторно'
        : 'Выслать SMS повторно'
    );
  return (
    <Form
      extraClassName="jest-reset-password-form-again"
      action="/api/account/reset-password/"
      method="post"
      onSuccess={(successData) => handleSuccess(successData)}
      onSubmit={(callback) => handleFormSubmit(callback)}
      onError={(errorList) => handleError(errorList)}>
      <div>
        <FormControl extraClassName="jest-reset-password-button-again">
          <Button
            isDisabled={isTimerActive}
            isInProgress={isDisabled}
            theme="secondary"
            size="small">
            {ButtonText}
            {isTimerActive && (
              <span>
                &nbsp;через&nbsp;
                <CountdownTimer
                  count={nextAttemptTimeout}
                  onTimerFinished = {() => handleTimerFinished()} />
                  &nbsp;сек.
              </span>
            )}
          </Button>
        </FormControl>
      </div>
    </Form>
  );
};

const ResetPasswordForm = (props) => {
  const { errorList, isDisabled, handleFormSubmit, updateFormField, handleSuccess, handleError } = props;
  return (
    <Form
      extraClassName="jest-reset-password-form"
      action="/api/account/reset-password/"
      method="post"
      onSubmit={(callback) => handleFormSubmit(callback)}
      onSuccess={(successList) => handleSuccess(successList)}
      onError={(errorList) => handleError(errorList)}>
      <div>
        <div className="jest-reset-password-identifier">
          <FormRow>
            <FormTextInput
              name="identifier"
              errorList={errorList.identifier}
              onUpdate={(input) => updateFormField(input)}
              isDisabled={isDisabled}
              isRequired
              isRequiredError="Введите почту или телефон"
              label="Почта или телефон" />
          </FormRow>
        </div>
        <FormControl extraClassName="jest-reset-password-submit">
          <Button isInProgress={isDisabled}>
            Отправить
          </Button>
        </FormControl>
      </div>
    </Form>
  );
};

class ResetPasswordView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorList: {},
      form: {},
      isTimerActive: false,
      isDisabled: false,
      isSuccess: false,
      nextAttemptTimeout: 100,
      identifierType: null,
    };
  }

  updateFormField(input) {
    this.setState((prevState) => {
      return {
        errorList: {},
        form: {
          ...prevState.form,
          ...input,
        },
      };
    });
  };

  handleFormSubmit(submit) {
    this.setState({
      errorList: {},
      isDisabled: true,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isDisabled: false,
      isSuccess: false,
    });
  }

  handleSuccess(successData) {
    window.scrollTo(0, 0);
    this.setState({
      errorList: {},
      isDisabled: false,
      isSuccess: true,
      isTimerActive: true,
      identifierType: successData.identifier_type,
      nextAttemptTimeout: successData.next_attempt_timeout,
      resetToken: successData.reset_token,
    });
  }

  handleReturnToEnterScreen() {
    // return the user to choose identifier screen
    this.setState({
      errorList: {},
      identifierType: null,
      form: {
        identifier: {
          value: '',
        },
      },
    });
  }

  handleTimerFinished() {
    this.setState({
      isTimerActive: false,
    });
  }

  render() {
    const {
      errorList, isDisabled, resetToken,
      nextAttemptTimeout, identifierType, isTimerActive,
    } = this.state;
    const userIdentifier = this.state.form.identifier ? this.state.form.identifier.value : '';

    const screenType = identifierType || 'enter';
    const resetPasswordText = {
      enter: `Забыли пароль? Введите свой адрес или телефон и мы вышлем вам инструкцию по восстановлению пароля.`,
      email: `Мы выслали на ваш e-mail ${userIdentifier} ` +
             `инструкцию по восстановлению пароля, она короткая и простая. Письмо должно ` +
             `прийти с минуты на минуту. Если ничего не помогло, у вас возникли какие-то другие ` +
             `сложности или вопросы, то не стесняйтесь и пишите нам`,
      phone: `Мы выслали SMS с кодом на ваш телефон ${userIdentifier}. Пожалуйста, ведите его в поле.`,
    }[screenType];
    const returnButtonText = {
      email: 'Я ошибся с вводом E-mail',
      phone: 'Я ошибся с вводом номера телефона',
    }[screenType];

    return (
      <div className={mainStyles.section}>
        <div className={styles.container}>
          <div className="title-2">Восстановление доступа</div>
          <div className={styles.text}>
            {resetPasswordText}
          </div>
          <div className={styles.form}>
            {identifierType === 'phone' && (
              <PasswordResetFormPhone
                resetToken={resetToken}
                history={this.props.history} />
            )}
            {identifierType === null
              ? (
                // "Enter the identifier" screen
                <ResetPasswordForm
                  errorList={errorList}
                  isDisabled={isDisabled}
                  handleFormSubmit={(callback) => this.handleFormSubmit(callback)}
                  handleSuccess={(successList) => this.handleSuccess(successList)}
                  handleError={(errorList) => this.handleError(errorList)}
                  updateFormField={(input) => this.updateFormField(input)} />
              )
              : (
                // Subcomponent (not an actual form) that provides a button to resubmit this form on countdown
                <ResetPasswordFormAgain
                  extraClassName="jest-reset-password-button-again"
                  isDisabled={isDisabled}
                  isTimerActive={isTimerActive}
                  nextAttemptTimeout={nextAttemptTimeout}
                  identifierType={identifierType}
                  handleSuccess={(successData) => this.handleSuccess(successData)}
                  handleFormSubmit={(callback) => this.handleFormSubmit(callback)}
                  handleError={(errorList) => this.handleError(errorList)}
                  handleTimerFinished={() => this.handleTimerFinished()} />
              )
            }
            {identifierType && (
              // Provide a button to return to the main form
              <div className={classNames(styles.returnButtonContainer, 'jest-reset-password-button-return')}>
                <Button theme="secondary" size="small" handleClick={() => this.handleReturnToEnterScreen()}>
                  {returnButtonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPasswordView;
