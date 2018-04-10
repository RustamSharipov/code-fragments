import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

import * as AuthFormActions from 'rebook/apps/users/actions/AuthFormActions';
import mainStyles from 'rebook/apps/base/style/main.scss';

import AuthForm from '../AuthForm';
import styles from './style.scss';


class AuthFormDialog extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.querySelector('body').classList.add('isFixed');
  }

  componentWillUnmount() {
    document.querySelector('body').classList.remove('isFixed');
  }

  render() {
    return (
      <div
        className={styles.container}
        onClick={
          (event) => {
            // hide the form if user clicked anywhere on the screen, except for the form itself
            event.target.getAttribute('data-window') && this.props.AuthFormActions.hideForm();
          }
        }
        data-window>
        <div className="gridColumn cols-4">
          <div className={classNames(styles.content, mainStyles.billetContainer)}>
            <div className={styles.inner}>
              <div className={styles.close}
                onClick={
                  (event) => {
                    event.preventDefault();
                    this.props.AuthFormActions.hideForm();
                  }}>
                <div className={styles.cross} />
              </div>
              <AuthForm displaySocialAuth {...this.props} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

function mapDispatchToProps(dispatch) {
  return {
    AuthFormActions: bindActionCreators(AuthFormActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(AuthFormDialog);
