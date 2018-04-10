import moment from 'moment-timezone';


function getCurrentDateTime() {
  return moment();
}

function getLocalDateTime(timestamp) {
  const dateTime = moment.tz(timestamp, API_TIMEZONE);
  const dateTimeWithTimeZone = dateTime.tz(TIMEZONE);
  return dateTimeWithTimeZone.locale(LOCALE);
}

function formatDateTime(timestamp, format) {
  return getLocalDateTime(timestamp).format(format);
}

export { getCurrentDateTime, getLocalDateTime, formatDateTime };
