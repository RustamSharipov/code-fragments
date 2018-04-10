import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from 'rebook/apps/base/components/Button';

import styles from './style.scss';


class FileInput extends React.Component {
  handleChange(event) {
    const { acceptTypes, maxFileSize, onAttach, onInvalidFileSize, onInvalidFileType } = this.props;
    const file = event.target.files[0];

    if (file) {
      const fileTypeIsValid = acceptTypes.indexOf(file.type) !== -1;
      const fileSizeIsValid = !maxFileSize || file.size <= maxFileSize;

      // Attach file with valid extension and size
      if (fileTypeIsValid && fileSizeIsValid) {
        let reader = new FileReader();
        let data = null;

        reader.addEventListener('load', () => {
          data = reader.result;

          if (onAttach) {
            onAttach(data);
          }
        });

        reader.readAsDataURL(file);
      }

      // File extension error
      else if (!fileTypeIsValid) {
        if (onInvalidFileType) {
          onInvalidFileType();
        }
      }

      // File size error
      else if (!fileSizeIsValid) {
        if (onInvalidFileSize) {
          onInvalidFileSize();
        }
      }
    }
  }

  render() {
    const { acceptTypes, caption, extraClassName, isDisabled, isInProgress, size } = this.props;
    return (
      <Button
        elementType="span"
        disabled={isDisabled}
        extraClassName={classNames(styles.fileInput, extraClassName)}
        isInProgress={isInProgress}
        theme="secondary"
        size={size}>
        <span>{caption}</span>
        <label className={styles.container}>
          <span className={styles.holder}>
            <input
              accept={acceptTypes.join(',')}
              disabled={isDisabled || isInProgress}
              type="file"
              onChange={(event) => this.handleChange(event)} />
          </span>
        </label>
      </Button>
    );
  }
};

FileInput.defaultProps = {
  acceptTypes: [],
  caption: 'Загрузить',
  extraClassName: '',
  isDisabled: false,
  isInProgress: false,
};

FileInput.propTypes = {
  acceptTypes: PropTypes.arrayOf(PropTypes.string),
  caption: PropTypes.string,
  extraClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  isInProgress: PropTypes.bool,
  maxFileSize: PropTypes.number,
  size: PropTypes.string,
};

export default FileInput;
