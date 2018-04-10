import fetchMock from 'fetch-mock';
import { UserFactory } from 'frontend/fixtures/users';
import { PaymentFactory } from 'frontend/fixtures/payments';
import { mountRoute } from 'frontend/utils/mount';


describe('Payments page tests', () => {
  const user = UserFactory.build();
  const defaultPriceMatrix = {
    pro: {
      1: {
        full_price: 379,
        advert_price_for_user: 180,
      },
      3: {
        full_price: 1090,
        advert_price_for_user: 900,
      },
      12: {
        full_price: 3790,
        advert_price_for_user: 3600,
      },
    },
    standard: {
      1: {
        full_price: 199,
        advert_price_for_user: 199,
      },
      3: {
        full_price: 559,
        advert_price_for_user: 559,
      },
      12: {
        full_price: 1999,
        advert_price_for_user: 1999,
      },
    },
  };

  beforeEach(() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
  });

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllTimers();
  });

  test('visit payments page as anonymous user', async() => {
    fetchMock.get('/api/profile/', { body: '', status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();
    // smoke test, no errors
    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.text()).toContain('Подписка в подарок');
  });

  test('subscription type is initialized with url param', async() => {
    const wrapper = mountRoute('/payments/?subscription_type=pro');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Оформление Премиум-подписки');
    expect(wrapper.text()).not.toContain('Что такое подписка?');
    expect(wrapper.text()).not.toContain('Подписка в подарок');
  });

  test('subscription type is initialized with legacy url param', async() => {
    const wrapper = mountRoute('/payments/?subscription_type=1');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Оформление Стандартной подписки');
    expect(wrapper.text()).not.toContain('Что такое подписка?');
    expect(wrapper.text()).not.toContain('Подписка в подарок');
  });

  test('gift subscription type is initialized', async() => {
    fetchMock.get('/api/prices/?gift=1', {
      body: defaultPriceMatrix,
      status: 200,
    });
    const wrapper = mountRoute('/payments/?gift=1&subscription_type=pro');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Оформление Премиум-подписки в подарок');
    expect(wrapper.text()).not.toContain('Что такое подписка?');
    expect(wrapper.text()).not.toContain('Подписка в подарок');
  });

  test('pay with credit card + gift code', async() => {
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
    });
    fetchMock.get('/api/prices/?gift=1', {
      body: defaultPriceMatrix,
      status: 200,
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.text()).toContain('Подписка в подарок');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-gift-premium-btn').at(0);
    expect(premiumButton.text()).toContain('Купить Премиум');

    const standardButton = wrapper.find('.jest-payments-gift-standard-btn').at(0);
    expect(standardButton.text()).toContain('Купить Стандарт');

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    // 12 month credit card is selected by default
    expect(wrapper.find('.jest-payments-subscription-period input[checked=true]').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-period input[checked=true]').at(0).prop('value'))
      .toEqual('12');
    expect(wrapper.find('.jest-payments-subscription-method input[checked=true]').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-method input[checked=true]').at(0).prop('value'))
      .toEqual('credit_card');

    expect(wrapper.text()).toContain('Итого к оплате:3600 ₽');

    expect(wrapper.find('.jest-payments-card-form').length).toEqual(1);
    expect(wrapper.find('.jest-payments-card-form-submit').length).toEqual(1);

    const submitCardButton = wrapper.find('.jest-payments-card-form-submit');
    expect(submitCardButton.text()).toContain('Оплатить 3600 ₽');

    const submitCardForm = wrapper.find('.jest-payments-card-form');

    // oops - server error
    fetchMock.post('/api/payments/', {
      body: '',
      status: 500,
    });
    submitCardForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Ошибка сервера. Попробуйте повторить позже');
    fetchMock.restore();

    fetchMock.post('/api/payments/', {
      body: PaymentFactory.build({ redirect_url: 'http://example.com/payonline-form/' }),
      status: 201,
    });

    window.location.assign = jest.fn();

    submitCardForm.simulate('submit');
    await flushPromises();
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/');
    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: { auto_rebill: true, gift: true, payment_method: 'credit_card', sub_months: '12', sub_type: 'pro' },
      provider: 'web',
    });

    // user is redirected to payonline
    expect(window.location.assign).toBeCalledWith('http://example.com/payonline-form/');
  });

  test('pay with credit card', async() => {
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
    });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    // 12 month credit card is selected by default
    expect(wrapper.find('.jest-payments-subscription-period input[checked=true]').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-period input[checked=true]').at(0).prop('value'))
      .toEqual('12');
    expect(wrapper.find('.jest-payments-subscription-method input[checked=true]').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-method input[checked=true]').at(0).prop('value'))
      .toEqual('credit_card');

    expect(wrapper.text()).toContain('Итого к оплате:3600 ₽');

    expect(wrapper.find('.jest-payments-card-form').length).toEqual(1);
    expect(wrapper.find('.jest-payments-card-form-submit').length).toEqual(1);

    const submitCardButton = wrapper.find('.jest-payments-card-form-submit');
    expect(submitCardButton.text()).toContain('Оплатить 3600 ₽');

    const submitCardForm = wrapper.find('.jest-payments-card-form');

    // oops - server error
    fetchMock.post('/api/payments/', {
      body: '',
      status: 500,
    });
    submitCardForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Ошибка сервера. Попробуйте повторить позже');
    fetchMock.restore();

    fetchMock.post('/api/payments/', {
      body: PaymentFactory.build({ redirect_url: 'http://example.com/payonline-form/' }),
      status: 201,
    });

    window.location.assign = jest.fn();

    submitCardForm.simulate('submit');
    await flushPromises();
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/');
    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: { auto_rebill: true, gift: false, payment_method: 'credit_card', sub_months: '12', sub_type: 'pro' },
      provider: 'web',
    });

    // user is redirected to payonline
    expect(window.location.assign).toBeCalledWith('http://example.com/payonline-form/');
  });

  test('pay with credit card as registering user', async() => {
    fetchMock.get('/api/profile/', { body: {}, status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    expect(wrapper.text()).toContain('Ваша электронная почта');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    expect(wrapper.find('.jest-registration-form').length).toEqual(1);
    let theForm = wrapper.find('.jest-registration-form form').at(0);
    theForm.simulate('submit');

    // no request is made because form requires email and pass
    expect(wrapper.text()).toContain('Введите почту');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-registration-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(wrapper.text()).not.toContain('Введите почту');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-registration-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    wrapper.find('.jest-registration-password input').simulate('change', {
      target: { name: 'password', value: 'secret' },
    });
    theForm = wrapper.find('.jest-registration-form form').at(0);

    // submit the form
    fetchMock.post('/api/registration/', {
      body: { email: ['Такая почта уже зарегистрирована'] },
      status: 400,
    });
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(4);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/registration/');
    expect(wrapper.text()).toContain('Такая почта уже зарегистрирована');

    fetchMock.restore();
    // submit the form with proper password
    fetchMock.post('/api/registration/', {
      body: {},
      status: 201,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });
    fetchMock.post('/api/payments/', {
      body: PaymentFactory.build({ redirect_url: 'http://example.com/payonline-form/' }),
      status: 201,
    });
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    window.location.assign = jest.fn();

    theForm = wrapper.find('.jest-registration-form form').at(0);
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls().length).toEqual(6);
    expect(fetchMock.calls()[0][0]).toEqual('/api/registration/');
    expect(fetchMock.calls()[1][0]).toEqual('/api/profile/');
    expect(fetchMock.calls()[2][0]).toEqual('/api/promocode/restore/');
    expect(fetchMock.calls()[3][0]).toEqual('/api/prices/');
    expect(fetchMock.calls()[5][0]).toEqual('/api/payments/');

    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).toContain('Оплатить');
    expect(wrapper.text()).not.toContain('Ваша электронная почта');
    expect(wrapper.text()).toContain('Итого к оплате:3600 ₽');

    // user is redirected to payonline
    expect(window.location.assign).toBeCalledWith('http://example.com/payonline-form/');
  });

  test('pay with credit card as logging user', async() => {
    fetchMock.get('/api/profile/', { body: {}, status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);
    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    expect(wrapper.find('.jest-registration-form').length).toEqual(1);
    expect(wrapper.find('.jest-login-button').length).toEqual(1);
    wrapper.find('.jest-login-button').simulate('click');

    expect(wrapper.find('.jest-auth-form').length).toEqual(1);
    let theForm = wrapper.find('.jest-auth-form form').at(0);
    wrapper.find('.jest-auth-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(wrapper.text()).not.toContain('Введите почту или телефон');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-auth-password input').simulate('change', {
      target: { name: 'password', value: 'secret' },
    });
    theForm = wrapper.find('.jest-auth-form form').at(0);

    // submit the form
    fetchMock.post('/api/auth/', {
      body: { password: ['Пароль неправильный, чувак'] },
      status: 400,
    });
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(4);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/auth/');
    // emoji popup is not seen
    expect(wrapper.text()).not.toContain('⚠️ Пароль неправильный, чувак');
    expect(wrapper.text()).toContain('Пароль неправильный, чувак');

    // submit the form with proper password
    fetchMock.restore();
    fetchMock.post('/api/auth/', {
      body: {},
      status: 200,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });
    fetchMock.post('/api/payments/', {
      body: PaymentFactory.build({ redirect_url: 'http://example.com/payonline-form/' }),
      status: 201,
    });
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    window.location.assign = jest.fn();

    wrapper.find('.jest-auth-password input').simulate('change', {
      target: { name: 'password', value: 'good_secret' },
    });
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls()[0][0]).toEqual('/api/auth/');
    expect(fetchMock.calls()[1][0]).toEqual('/api/profile/');
    expect(fetchMock.calls()[2][0]).toEqual('/api/promocode/restore/');
    expect(fetchMock.calls()[3][0]).toEqual('/api/prices/');
    expect(fetchMock.calls()[5][0]).toEqual('/api/payments/');

    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).toContain('Оплатить');
    expect(wrapper.text()).not.toContain('Почта или телефон');
    expect(wrapper.text()).toContain('Итого к оплате:3600 ₽');

    // user is redirected to payonline
    expect(window.location.assign).toBeCalledWith('http://example.com/payonline-form/');
  });

  test('pay with sms', async() => {
    jest.useFakeTimers();

    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(fetchMock.calls(true).length).toEqual(5);

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(0);

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    wrapper.find('.jest-payments-subscription-method[data-jest-payments-subscription-method="sms"]')
      .simulate('click');

    // phone number input is now displayed
    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(1);
    const smsPhoneInput = wrapper.find('.jest-payments-sms-form-phone');
    const submitSmsForm = wrapper.find('.jest-payments-sms-form');
    // phone is required, no requests made to server
    submitSmsForm.simulate('submit');
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(1);
    expect(wrapper.find('.jest-form-sms_phone-error').at(0).text()).toContain('Укажите номер телефона');
    expect(fetchMock.calls(true).length).toEqual(5);

    // server returns 400
    fetchMock.post('/api/payments/', {
      body: { non_field_errors: ['К сожалению мы принимаем оплату через смс только для России'] },
      status: 400,
    });
    smsPhoneInput.simulate('change', {
      target: { name: 'sms_phone', value: '+380670480002' },
    });
    // client side error is removed on change
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(0);

    submitSmsForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    // server side error is displayed instead
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(1);
    expect(wrapper.find('.jest-form-sms_phone-error').at(0).text())
      .toContain('К сожалению мы принимаем оплату через смс только для России');

    smsPhoneInput.simulate('change', {
      target: { name: 'sms_phone', value: '+77771234567' },
    });
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(0);

    const newPaymentObj = PaymentFactory.build({
      uuid: 'd20f1f3c-e278-4fbc-ab8e-c6f04db43702',
      phone: '+77771234567',
      status: 'new',
    });
    const pendingPaymentObj = PaymentFactory.build({ ...newPaymentObj, status: 'pending' });
    const acceptedPaymentObj = PaymentFactory.build({ ...newPaymentObj, status: 'accepted' });

    fetchMock.restore();
    fetchMock.post('/api/payments/', {
      body: newPaymentObj,
      status: 201,
    });
    // sms payment is successfully accepted and is being processed server side
    submitSmsForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Мы отправили сообщение с просьбой подтвердить оплату на номер +77771234567');

    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: {
        auto_rebill: true, gift: false, payment_method: 'sms',
        sub_months: '12', sub_type: 'pro', sms_phone: '+77771234567',
      },
      provider: 'web',
    });

    expect(setTimeout).toHaveBeenCalledTimes(1);
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: pendingPaymentObj,
      status: 200,
    });
    // a status check is made on timer
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');
    // another status check is made in n secs
    fetchMock.restore();
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: acceptedPaymentObj,
      status: 200,
    });
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');

    // no more timers are set
    jest.runAllTimers();
    expect(setTimeout).toHaveBeenCalledTimes(3);
  });

  test('pay with sms as registering user', async() => {
    fetchMock.get('/api/profile/', { body: {}, status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    jest.useFakeTimers();

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(0);

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    // choose sms
    wrapper.find('.jest-payments-subscription-method[data-jest-payments-subscription-method="sms"]')
      .simulate('click');

    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(0);
    expect(wrapper.text()).toContain('Ваша электронная почта');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    expect(wrapper.find('.jest-registration-form').length).toEqual(1);
    let theForm = wrapper.find('.jest-registration-form form').at(0);
    theForm.simulate('submit');

    // no request is made because form requires email and pass
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(wrapper.text()).toContain('Введите почту');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-registration-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(wrapper.text()).not.toContain('Введите почту');
    expect(wrapper.text()).toContain('Введите пароль');

    fetchMock.restore();
    // submit the form with proper password
    fetchMock.post('/api/registration/', {
      body: {},
      status: 201,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    wrapper.find('.jest-registration-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    wrapper.find('.jest-registration-password input').simulate('change', {
      target: { name: 'password', value: 'secret' },
    });
    theForm = wrapper.find('.jest-registration-form form').at(0);
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(4);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/registration/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');

    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).toContain('Оплатить');
    expect(wrapper.text()).not.toContain('Ваша электронная почта');

    // phone number input is now displayed
    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(1);
    const smsPhoneInput = wrapper.find('.jest-payments-sms-form-phone');
    const submitSmsForm = wrapper.find('.jest-payments-sms-form');
    // phone is required, no requests made to server
    submitSmsForm.simulate('submit');
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(1);
    expect(wrapper.find('.jest-form-sms_phone-error').at(0).text()).toContain('Укажите номер телефона');

    smsPhoneInput.simulate('change', {
      target: { name: 'sms_phone', value: '+77771234567' },
    });
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(0);

    const acceptedPaymentObj = PaymentFactory.build({
      uuid: 'd20f1f3c-e278-4fbc-ab8e-c6f04db43702',
      phone: '+77771234567',
      status: 'accepted',
    });
    fetchMock.restore();
    fetchMock.post('/api/payments/', {
      body: acceptedPaymentObj,
      status: 201,
    });
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: acceptedPaymentObj,
      status: 200,
    });
    // sms payment is successfully accepted and is being processed server side
    submitSmsForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Мы отправили сообщение с просьбой подтвердить оплату на номер +77771234567');

    expect(fetchMock.calls(true).length).toEqual(1);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/');
    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: {
        auto_rebill: true, gift: false, payment_method: 'sms',
        sub_months: '12', sub_type: 'pro', sms_phone: '+77771234567',
      },
      provider: 'web',
    });

    jest.runAllTimers();
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');

    expect(setTimeout).toHaveBeenCalledTimes(3);
  });

  test('pay with sms as logging user', async() => {
    fetchMock.get('/api/profile/', { body: {}, status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    jest.useFakeTimers();

    expect(wrapper.text()).toContain('Что такое подписка?');
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(1);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(0);

    const premiumButton = wrapper.find('.jest-payments-pro-subscription-type').at(0);
    expect(premiumButton.text()).toContain('Купить от 180 ₽ в месяц');

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    expect(standardButton.text()).toContain('Купить от 199 ₽ в месяц');

    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(0);

    // choose premium subscription
    premiumButton.simulate('click');
    // the subscription page is now seen
    expect(wrapper.find('.jest-payments-subscription-types').length).toEqual(0);
    expect(wrapper.find('.jest-payments-subscription-page').length).toEqual(1);

    // choose sms
    wrapper.find('.jest-payments-subscription-method[data-jest-payments-subscription-method="sms"]')
      .simulate('click');

    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(0);
    expect(wrapper.text()).toContain('Ваша электронная почта');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    expect(wrapper.find('.jest-registration-form').length).toEqual(1);
    expect(wrapper.find('.jest-login-button').length).toEqual(1);
    wrapper.find('.jest-login-button').simulate('click');

    expect(wrapper.find('.jest-auth-form').length).toEqual(1);
    wrapper.find('.jest-auth-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    wrapper.find('.jest-auth-form form').at(0).simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(wrapper.text()).not.toContain('Введите почту или телефон');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-auth-password input').simulate('change', {
      target: { name: 'password', value: 'secret' },
    });

    // submit the form
    fetchMock.post('/api/auth/', {
      body: { password: ['Пароль неправильный, чувак'] },
      status: 400,
    });
    wrapper.find('.jest-auth-form form').at(0).simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(4);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/auth/');
    // emoji popup is not seen
    expect(wrapper.text()).not.toContain('⚠️ Пароль неправильный, чувак');
    expect(wrapper.text()).toContain('Пароль неправильный, чувак');

    // submit the form with proper password
    fetchMock.restore();
    fetchMock.post('/api/auth/', {
      body: {},
      status: 200,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    wrapper.find('.jest-auth-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    wrapper.find('.jest-auth-password input').simulate('change', {
      target: { name: 'password', value: 'secret' },
    });
    wrapper.find('.jest-auth-form form').at(0).simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(4);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/auth/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');
    expect(fetchMock.calls(true)[2][0]).toEqual('/api/promocode/restore/');
    expect(fetchMock.calls(true)[3][0]).toEqual('/api/prices/');

    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).toContain('Оплатить');
    expect(wrapper.text()).not.toContain('Ваша электронная почта');

    // phone number input is now displayed
    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(1);
    const smsPhoneInput = wrapper.find('.jest-payments-sms-form-phone');
    const submitSmsForm = wrapper.find('.jest-payments-sms-form');
    smsPhoneInput.simulate('change', {
      target: { name: 'sms_phone', value: '+77771234567' },
    });

    const acceptedPaymentObj = PaymentFactory.build({
      uuid: 'd20f1f3c-e278-4fbc-ab8e-c6f04db43702',
      phone: '+77771234567',
      status: 'accepted',
    });
    fetchMock.restore();
    fetchMock.post('/api/payments/', {
      body: acceptedPaymentObj,
      status: 201,
    });
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: acceptedPaymentObj,
      status: 200,
    });
    // sms payment is successfully accepted and is being processed server side
    submitSmsForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Мы отправили сообщение с просьбой подтвердить оплату на номер +77771234567');

    expect(fetchMock.calls(true).length).toEqual(1);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/');
    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: {
        auto_rebill: true, gift: false, payment_method: 'sms',
        sub_months: '12', sub_type: 'pro', sms_phone: '+77771234567',
      },
      provider: 'web',
    });

    jest.runAllTimers();
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');

    expect(setTimeout).toHaveBeenCalledTimes(3);
  });

  test('pay with sms no funds error', async() => {
    jest.useFakeTimers();

    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    expect(fetchMock.calls(true).length).toEqual(5);

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    standardButton.simulate('click');

    wrapper.find('.jest-payments-subscription-method[data-jest-payments-subscription-method="sms"]')
      .simulate('click');

    // phone number input is now displayed
    expect(wrapper.find('.jest-payments-sms-form-phone').length).toEqual(1);
    const smsPhoneInput = wrapper.find('.jest-payments-sms-form-phone');
    const submitSmsForm = wrapper.find('.jest-payments-sms-form');

    smsPhoneInput.simulate('change', {
      target: { name: 'sms_phone', value: '+77771234567' },
    });
    expect(wrapper.find('.jest-form-sms_phone-error').length).toEqual(0);

    const newPaymentObj = PaymentFactory.build({
      uuid: 'd20f1f3c-e278-4fbc-ab8e-c6f04db43702',
      phone: '+77771234567',
      status: 'new',
    });
    const pendingPaymentObj = PaymentFactory.build({ ...newPaymentObj, status: 'pending' });
    const declinedPaymentObj = PaymentFactory.build({
      ...newPaymentObj,
      status: 'declined',
      failure_messages: ['Недостаточно средств для проведения платежа'],
    });

    fetchMock.post('/api/payments/', {
      body: newPaymentObj,
      status: 201,
    });
    // sms payment is successfully accepted and is being processed server side
    submitSmsForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Мы отправили сообщение с просьбой подтвердить оплату на номер +77771234567');

    expect(fetchMock.calls(true).length).toEqual(6);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/');
    expect(JSON.parse(fetchMock.lastCall(true)[1].body)).toEqual({
      data: {
        auto_rebill: true, gift: false, payment_method: 'sms',
        sub_months: '12', sub_type: 'standard', sms_phone: '+77771234567',
      },
      provider: 'web',
    });

    expect(setTimeout).toHaveBeenCalledTimes(1);
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: pendingPaymentObj,
    });
    // a status check is made on timer
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(fetchMock.calls(true).length).toEqual(7);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');
    // another status check is made in n secs
    fetchMock.restore();
    fetchMock.get('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/', {
      body: declinedPaymentObj,
    });
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/payments/d20f1f3c-e278-4fbc-ab8e-c6f04db43702/');

    // no more timers are set
    jest.runAllTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);

    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Недостаточно средств для проведения платежа');
  });

  test('pay with sms using saved phone number', async() => {
    const userWithPaymentPhone = UserFactory.build({ payment_phone: '+79991234567' });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithPaymentPhone] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const standardButton = wrapper.find('.jest-payments-standard-subscription-type').at(0);
    standardButton.simulate('click');

    wrapper.find('.jest-payments-subscription-method[data-jest-payments-subscription-method="sms"]')
      .simulate('click');

    const smsPhoneInput = wrapper.find('.jest-payments-sms-form-phone').at(0);
    expect(smsPhoneInput.prop('value')).toEqual('+79991234567');
  });

  test('check social buttons are not display in auth forms', async() => {
    fetchMock.get('/api/profile/', { body: '', status: 401 });
    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    wrapper.find('.jest-payments-pro-subscription-type').simulate('click');
    let theForm = wrapper.find('.jest-registration-form').at(0);
    expect(theForm.find('.jest-social-auth').length).toEqual(0);

    wrapper.find('.jest-login-button').simulate('click');
    theForm = wrapper.find('.jest-auth-form').at(0);
    expect(theForm.find('.jest-social-auth').length).toEqual(0);
  });
});
