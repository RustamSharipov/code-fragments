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
import { USER_SETTINGS_SUCCESS_MESSAGES } from 'rebook/apps/users/constants';
import mainStyles from 'rebook/apps/base/style/main.scss';


class UserSettingsPersonalData extends React.Component {
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
  }

  handleSuccess() {
    this.setState({
      errorList: {},
      isInProgress: false,
    });
    this.props.NotificationActions.pop(USER_SETTINGS_SUCCESS_MESSAGES.USER_PERSONAL_DATA_UPDATED, 'success');
    this.props.UserActions.fetchCurrentUser();
  }

  render() {
    const { user } = this.props;
    const { errorList, isDisabled, isInProgress } = this.state;
    return (
      <div className={mainStyles.billetContainer}>
        <div className="title-2">Ваши данные</div>
        <Form
          action={`/api/profile/${user.id}/`}
          method="PATCH"
          fetchParams={{ apiVersion: 4 }}
          extraClassName="jest-userprofile-form"
          onSubmit={(callback) => this.handleSubmit(callback)}
          onSuccess={(data) => this.handleSuccess(data)}
          onError={(errorList) => this.handleError(errorList)}>
          <FormRow>
            <FormTextInput
              extraClassName="jest-userprofile-firstname"
              errorList={errorList.first_name}
              isDisabled={isDisabled || isInProgress}
              label="Имя"
              onUpdate={(input) => this.updateFormField(input)}
              name="first_name"
              value={user.first_name} />
          </FormRow>
          <FormRow>
            <FormTextInput
              extraClassName="jest-userprofile-lastname"
              errorList={errorList.last_name}
              isDisabled={isDisabled || isInProgress}
              label="Фамилия"
              onUpdate={(input) => this.updateFormField(input)}
              name="last_name"
              value={user.last_name} />
          </FormRow>
          <FormControl>
            <Button
              type="submit"
              extraClassName="jest-userprofile-form-submit"
              theme="secondary"
              size="small"
              isInProgress={isInProgress}>
              Сохранить
            </Button>
          </FormControl>
        </Form>
      </div>
    );
  }
}

UserSettingsPersonalData.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};

function mapDispatchToProps(dispatch) {
  return {
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
    UserActions: bindActionCreators(UserActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UserSettingsPersonalData);
