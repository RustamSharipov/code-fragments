export default function(form) {
  let fieldErrors = {};

  // Parse form
  Object.keys(form).forEach(
    (key) => {
      const {
        isRequired, isRequiredError,
        minLength, minLengthError, value,
      } = form[key];
      let fieldErrorList = [];

      // Apply required field rule:
      if (isRequired && value.length === 0) {
        fieldErrorList.push(isRequiredError);
      }

      // Apply min length rule: mark as invalid if minimal length is less then minLength
      if (minLength && value.length < minLength) {
        fieldErrorList.push(minLengthError);
      }

      if (fieldErrorList.length > 0) {
        fieldErrors[key] = fieldErrorList;
      }
    }
  );

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...form,
      errorList: fieldErrors,
    };
  }

  return form;
}
