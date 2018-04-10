import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import Button from 'rebook/apps/base/components/Button';
import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import AuthForm from 'rebook/mybook/App/AuthForm';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


class GiftCodeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      errorList: {},
      isInProgress: false,
    };
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

  handleSuccess() {
    window.scrollTo(0, 0);
    this.setState({
      errorList: {},
      isInProgress: false,
      isSuccess: true,
    });
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
      isSuccess: false,
    });
  }

  render() {
    const { errorList, isInProgress, isSuccess } = this.state;
    const { user } = this.props;

    return (
      <div className={classNames(mainStyles.backgroundContainer, 'themeOrange')}>
        <div className="gridColumn cols-4">
          <header className={mainStyles.sectionHeader}>
            <div className="title-1">Подарочный код</div>
          </header>
          {user
            ? (
              <div className={mainStyles.billetContainer}>
                {isSuccess
                  ? (
                    <div className={styles.giftCodeFormSuccess}>
                      <div className={styles.giftCodeFormHeaderImage} />
                      <div className="title-2">Код принят!</div>
                    </div>
                  )
                  : (
                    <Form
                      action="/api/gift-activate/"
                      method="post"
                      extraClassName="jest-giftcode-form"
                      onSubmit={(callback) => this.handleSubmit(callback)}
                      onSuccess={() => this.handleSuccess()}
                      onError={(errorList) => this.handleError(errorList)}>
                      <FormRow>
                        <FormTextInput
                          extraClassName="jest-giftcode-form-code"
                          validationMessageExtraClassName="jest-giftcode-form-code-error"
                          errorList={errorList.code || errorList.non_field_errors}
                          isDisabled={isInProgress}
                          isRequired
                          isRequiredError="Введите код в поле"
                          label="Если у вас есть подарочный код MyBook, активируйте его здесь"
                          onUpdate={(input) => this.updateFormField(input)}
                          name="code" />
                      </FormRow>
                      <FormControl>
                        <Button
                          extraClassName="jest-giftcode-form-submit"
                          isInProgress={isInProgress}>
                          Активировать
                        </Button>
                      </FormControl>
                    </Form>
                  )
                }
              </div>
            )
            : (
              <div>
                <p>Войдите или зарегистрируйтесь, чтобы активировать подарочный код</p>
                <div className={mainStyles.billetContainer}>
                  <AuthForm
                    type="registration"
                    hideTitle
                    noSuccessNotification />
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(GiftCodeView);
