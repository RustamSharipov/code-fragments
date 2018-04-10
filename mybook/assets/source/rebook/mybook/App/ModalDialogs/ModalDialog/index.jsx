import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as ModalDialogActions from 'rebook/apps/base/actions/ModalDialogActions';
import mainStyles from 'rebook/apps/base/style/main.scss';

import styles from './style.scss';


class ModalDialog extends React.Component {
  componentDidMount() {
    document.querySelector('body').classList.add('nonScrollableBody');
  }

  handleAction(action, dialogId) {
    this.closeDialog(dialogId);
    const { onClick } = action;
    if (onClick) {
      onClick();
    }
  }

  closeDialog(dialogId) {
    const { ModalDialogActions, onClose } = this.props;
    ModalDialogActions.remove(dialogId);
    document.querySelector('body').classList.remove('nonScrollableBody');

    if (onClose) {
      onClose();
    }
  }

  render() {
    const { dialog } = this.props;

    return (
      <div className={classNames(styles.container, dialog.extraClassName)}>
        <div className={styles.fill} onClick={() => this.closeDialog(dialog.id)} />
        <div className="gridColumn cols-6">
          <div className={classNames(styles.dialog, mainStyles.billetContainer)}>
            <div className={classNames(
              styles.dialogContent,
              (dialog.emojiIcon || dialog.icon) && 'hasIcon',
              dialog.actions && 'hasActions',
            )}>
              {!dialog.hideCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => this.closeDialog(dialog.id)} />
              )}
              {dialog.emojiIcon && (
                <div className={classNames(styles.icon, styles.emojiIcon)}>
                  {dialog.emojiIcon}
                </div>
              )}
              {dialog.title && (
                <div>
                  <div className="title-3">{dialog.title}</div>
                </div>
              )}
              {dialog.content && (
                <div>
                  {dialog.content}
                </div>
              )}
            </div>
            {dialog.actions && (
              <div className={styles.actions}>
                {dialog.actions.map((item) => (
                  <div
                    key={item.id}
                    className={classNames(styles.action, item.extraClassName)}
                    onClick={() => this.handleAction(item, dialog.id)}>
                    {item.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

ModalDialog.propTypes = {
  dialogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      emojiIcon: PropTypes.string,
      title: PropTypes.string,
      content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
      ]).isRequired,
    })
  ),
};

function mapDispatchToProps(dispatch) {
  return {
    ModalDialogActions: bindActionCreators(ModalDialogActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ModalDialog);
