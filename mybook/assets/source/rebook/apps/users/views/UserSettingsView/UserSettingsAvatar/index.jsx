import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as NotificationActions from 'rebook/apps/users/actions/NotificationActions';
import * as UserActions from 'rebook/apps/users/actions/UserActions';
import FileInput from 'rebook/apps/base/components/FileInput';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import formatFileSize from 'rebook/apps/utils/text/formatFileSize';
import { USER_SETTINGS_ERROR_MESSAGES, USER_SETTINGS_SUCCESS_MESSAGES, MAX_IMAGE_FILE_SIZE }
  from 'rebook/apps/users/constants';
import FORM_ERROR_MESSAGES from 'rebook/apps/base/components/form/constants';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


class UserSettingsAvatar extends React.Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      isInProgress: false,
      userImage: user.avatar || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const { user } = nextProps;
    this.setState({
      userImage: user.avatar || null,
    });
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  uploadImage(image) {
    if (image) {
      this.setState({
        isInProgress: true,
      });

      const { user } = this.props;
      const base64string = image.split(',', 2)[1];
      const url = `/api/profile/${user.id}/`;
      const params = {
        apiVersion: 4,
        json: {
          avatar: base64string,
        },
        method: 'PATCH',
      };

      fetchQuery(url, params)
        .then(() => {
          this.setState({
            isInProgress: false,
          });
          this.props.UserActions.fetchCurrentUser();
          this.props.NotificationActions.pop(USER_SETTINGS_SUCCESS_MESSAGES.USER_IMAGE_UPLOADED, 'success');
        })
        .catch(({ data, resp }) => {
          this.setState({
            isInProgress: false,
          });

          // Add 'valid' errors to error list
          if (resp.status === 400) {
            const errorMessages = data.avatar || data.non_field_errors;
            this.props.NotificationActions.pop(errorMessages[0], 'error');
          }

          // Add internal server error to error list
          else {
            this.props.NotificationActions.pop(FORM_ERROR_MESSAGES.SERVER_ERROR, 'error');
            Raven.captureMessage('failed to change user image due to server error', {
              level: 'error',
              extra: {
                status: resp.status,
                content: data,
              },
            });
          }
        });
    }
  }

  handleInvalidImageFileSize() {
    this.props.NotificationActions.pop(USER_SETTINGS_ERROR_MESSAGES.INVALID_FILE_SIZE, 'error');
  }

  handleInvalidImageFileType() {
    this.props.NotificationActions.pop(USER_SETTINGS_ERROR_MESSAGES.INVALID_FILE_TYPE, 'error');
  }

  render() {
    const { isInProgress, userImage } = this.state;
    const userImagePanoramStyle = userImage ? { backgroundImage: `url(${userImage})` } : {};

    return (
      <div className={classNames(mainStyles.billetContainer, styles.changeAvatar)}>
        <div className={styles.userImagePanoram}>
          <div
            className={classNames(styles.userImagePanoramImage, 'jest-avatar-panoram')}
            style={userImagePanoramStyle} />
        </div>
        <div className={styles.userImage}>
          <div className={styles.userImagePreview}>
            {userImage
              ? (
                <img
                  className={classNames(styles.userImagePreviewContent, 'jest-avatar-preview')}
                  src={userImage}
                  width="80"
                  height="80" />
              )
              : <div className={classNames(styles.userImagePreviewEmpty, 'jest-avatar-emptypreview')} />
            }
          </div>
          <div className={styles.control}>
            <FileInput
              acceptTypes={['image/jpeg', 'image/png']}
              caption="Сменить фото"
              extraClassName="jest-avatar-input"
              isInProgress={isInProgress}
              maxFileSize={MAX_IMAGE_FILE_SIZE}
              size="small"
              onAttach={(data) => this.uploadImage(data)}
              onInvalidFileSize={(data) => this.handleInvalidImageFileSize(data)}
              onInvalidFileType={(data) => this.handleInvalidImageFileType(data)} />
          </div>
          <div className={styles.description}>
            <small>Картинка в форматах png и jpg.<br />Не более {formatFileSize(MAX_IMAGE_FILE_SIZE)}</small>
          </div>
        </div>
      </div>
    );
  }
}

UserSettingsAvatar.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
  }),
};

function mapDispatchToProps(dispatch) {
  return {
    NotificationActions: bindActionCreators(NotificationActions, dispatch),
    UserActions: bindActionCreators(UserActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UserSettingsAvatar);
