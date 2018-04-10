import React from 'react';
import classNames from 'classnames';

import Button from 'rebook/apps/base/components/Button';

import styles from './style.scss';


class CopyToClipboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCopied: false,
    };
  }

  handleClick(event) {
    const { copiedClassNameDuration, onCopy } = this.props;
    const copyToClipboardIsSupported = document.queryCommandSupported('copy');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.target.parentNode);
    selection.removeAllRanges();
    selection.addRange(range);
    const content = selection.toString();

    if (copyToClipboardIsSupported) {
      document.execCommand('copy');
      selection.removeAllRanges();
      this.setState({ isCopied: true }, () => {
        if (copiedClassNameDuration) {
          setTimeout(
            () => {
              this.setState({ isCopied: false });
            },
            copiedClassNameDuration,
          );
        }

        if (onCopy) {
          onCopy(content);
        }
      });
    }
  }

  render() {
    const { children, copiedClassName, extraClassName, hasCopyButton } = this.props;
    const { isCopied } = this.state;
    const elementClassNames = classNames(
      styles.copyContent,
      extraClassName,
      isCopied && copiedClassName
    );

    return (
      <React.Fragment>
        {hasCopyButton
          ? (
            <span onClick={(event) => this.handleClick(event)}>
              <span className={elementClassNames}>
                {children}
              </span>
              <Button theme="secondary" size="small">
                Скопировать код
              </Button>
            </span>
          )
          : (
            <span>
              <span className={elementClassNames} onClick={(event) => this.handleClick(event)}>
                {children}
              </span>
            </span>
          )
        }
      </React.Fragment>
    );
  }
}

export default CopyToClipboard;
