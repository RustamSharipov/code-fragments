import formatFileSize from 'rebook/apps/utils/text/formatFileSize';


export const USERS_USER_SET = 'USERS_USER_SET';
export const USERS_USER_REMOVE = 'USERS_USER_REMOVE';

export const USERS_AUTHFORM_SHOW = 'USERS_AUTHFORM_SHOW';
export const USERS_AUTHFORM_HIDE = 'USERS_AUTHFORM_HIDE';

export const USERS_NOTIFICATION_POP = 'USERS_NOTIFICATION_POP';
export const USERS_NOTIFICATION_REMOVE = 'USERS_NOTIFICATION_REMOVE';

export const USERS_MODAL_DIALOG_POP = 'USERS_MODAL_DIALOG_POP';
export const USERS_MODAL_DIALOG_REMOVE = 'USERS_MODAL_DIALOG_REMOVE';

export const USERS_AUTH_LOGIN_NOTIFICATIONS = {
  RESET_PASSWORD_SUCCESS: '🎊 Ваш пароль изменен!',
  ERROR: '😞 Что-то пошло не так. Наши инженеры уже занимаются проблемой.',
  LOGOUT: '🏃‍ Вы успешно вышли из учетной записи',
  SUCCESS: '🎉 Добро пожаловать в MyBook!',
};

export const MAX_IMAGE_FILE_SIZE = 1024 * 1024 * 5; // in bytes

export const USER_SETTINGS_SUCCESS_MESSAGES = {
  USER_IMAGE_UPLOADED: 'Картинка загружена',
  USER_PERSONAL_DATA_UPDATED: 'Ваши имя и фамилия в MyBook изменены',
  USER_FIRST_NAME_UPDATED: 'Ваше имя в MyBook изменено',
  USER_LAST_NAME_UPDATED: 'Ваша фамилия в MyBook изменена',
  USER_PASSWORD_UPDATED: 'Пароль изменен',
};

export const USER_SETTINGS_ERROR_MESSAGES = {
  INVALID_FILE_SIZE: `Картинка должна быть не более ${formatFileSize(MAX_IMAGE_FILE_SIZE)}`,
  INVALID_FILE_TYPE: 'Неверный формат картинки',
  PASSWORD_IS_REQUIRED: 'Заполните это поле',
  PASSOWRDS_MUST_NOT_MATCH: 'Пароли не должны совпадать',
};

export const WALLETS_DATA_SET = 'WALLETS_DATA_SET';
