import fetchMock from 'fetch-mock';
import { UserFactory } from 'frontend/fixtures/users';
import { mountRoute } from 'frontend/utils/mount';


describe('Gift code page tests', () => {
  const user = UserFactory.build();

  beforeEach(() => {
    fetchMock.get('/api/profile/', { objects: [user] });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('Submit empty code', async() => {
    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();
    const form = wrapper.find('.jest-giftcode-form').at(0);
    const submitButton = wrapper.find('.jest-giftcode-form-submit').at(0);
    expect(wrapper.text()).toContain('Подарочный код');

    // Find form
    expect(form.length).toEqual(1);
    expect(wrapper.find('.jest-giftcode-form-code').at(0).length).toEqual(1);

    // Submit form
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    expect(wrapper.find('.jest-giftcode-form-code-error').at(0).text()).toContain('Введите код в поле');
  });

  test('Submit already activated code by authenticated user', async() => {
    fetchMock.post('/api/gift-activate/', {
      body: { non_field_errors: ['Этот код уже активирован'] },
      status: 400,
    });

    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();
    const form = wrapper.find('.jest-giftcode-form').at(0);
    const codeField = wrapper.find('.jest-giftcode-form-code');
    const submitButton = wrapper.find('.jest-giftcode-form-submit');
    expect(wrapper.text()).toContain('Подарочный код');

    // Find form
    expect(form.length).toEqual(1);
    expect(codeField.length).toEqual(1);

    // Submit form
    codeField.simulate('change', {
      target: { name: 'code', value: 'ALREADY ACTIVATED' },
    });
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.find('.jest-giftcode-form-code-error').at(0).text()).toContain('Этот код уже активирован');
  });

  test('Submit invalid code by authenticated user', async() => {
    fetchMock.post('/api/gift-activate/', {
      body: { non_field_errors: ['Указан неверный код'] },
      status: 400,
    });

    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();
    const form = wrapper.find('.jest-giftcode-form').at(0);
    const codeField = wrapper.find('.jest-giftcode-form-code').at(0);
    const submitButton = wrapper.find('.jest-giftcode-form-submit').at(0);
    expect(wrapper.text()).toContain('Подарочный код');

    // Find form
    expect(form.length).toEqual(1);
    expect(codeField.length).toEqual(1);

    // Submit form
    codeField.simulate('change', {
      target: { name: 'code', value: 'WRONG' },
    });
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.find('.jest-giftcode-form-code-error').at(0).text()).toContain('Указан неверный код');
  });

  test('Submit valid code by authenticated user', async() => {
    fetchMock.post('/api/gift-activate/', {
      body: {},
      status: 201,
    });

    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();
    const form = wrapper.find('.jest-giftcode-form').at(0);
    const codeField = wrapper.find('.jest-giftcode-form-code').at(0);
    const submitButton = wrapper.find('.jest-giftcode-form-submit').at(0);
    expect(wrapper.text()).toContain('Подарочный код');

    // Find form
    expect(form.length).toEqual(1);
    expect(codeField.length).toEqual(1);

    // Submit form
    codeField.simulate('change', {
      target: { name: 'code', value: 'RIGHT' },
    });
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Код принят!');
  });

  test('Submit non empty code by unauthenticated user', async() => {
    fetchMock.restore();
    fetchMock.get('/api/profile/', {
      body: {},
      status: 401,
    });

    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.text()).toContain('Ваша электронная почта');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    let theLoginMenuButton = wrapper.find('.jest-login-button').at(0);
    theLoginMenuButton.simulate('click');

    expect(wrapper.find('.jest-auth-form').length).toEqual(1);
    let theForm = wrapper.find('.jest-auth-form form').at(0);
    theForm.simulate('submit');

    // no request is made because form requires email and pass
    expect(fetchMock.calls(true).length).toEqual(1);
    expect(wrapper.text()).toContain('Введите почту или телефон');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-auth-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(1);
    expect(wrapper.text()).not.toContain('Введите почту');
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
    expect(fetchMock.calls(true).length).toEqual(2);
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
    fetchMock.post('/api/gift-activate/', {
      body: {},
      status: 201,
    });

    wrapper.find('.jest-auth-password input').simulate('change', {
      target: { name: 'password', value: 'good_secret' },
    });
    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/auth/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');
    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).not.toContain('Войти');

    const form = wrapper.find('.jest-giftcode-form').at(0);
    const codeField = wrapper.find('.jest-giftcode-form-code').at(0);
    const submitButton = wrapper.find('.jest-giftcode-form-submit').at(0);
    expect(wrapper.text()).toContain('Активировать');

    // Find form
    expect(form.length).toEqual(1);
    expect(codeField.length).toEqual(1);

    // Submit form
    codeField.simulate('change', {
      target: { name: 'code', value: 'RIGHT' },
    });
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Код принят!');
  });

  test('Submit code return internal server error', async() => {
    fetchMock.post('/api/gift-activate/', { body: '', status: 500 });

    // Set right activate gift page
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();
    const form = wrapper.find('.jest-giftcode-form').at(0);
    const codeField = wrapper.find('.jest-giftcode-form-code').at(0);
    const submitButton = wrapper.find('.jest-giftcode-form-submit').at(0);
    expect(wrapper.text()).toContain('Подарочный код');

    // Find form
    expect(form.length).toEqual(1);
    expect(codeField.length).toEqual(1);

    // Submit form
    codeField.simulate('change', {
      target: { name: 'code', value: 'ANY' },
    });
    expect(submitButton.length).toEqual(1);
    expect(submitButton.prop('disabled')).toEqual(false);
    form.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.text()).toContain('Ошибка сервера. Попробуйте повторить позже');
  });

  test('check social buttons are not display in auth forms', async() => {
    fetchMock.restore();
    fetchMock.get('/api/profile/', {
      body: {},
      status: 401,
    });
    const wrapper = mountRoute('/payments/activate_gift/');
    await flushPromises();
    await wrapper.update();

    let theForm = wrapper.find('.jest-registration-form').at(0);
    expect(theForm.find('.jest-social-auth').length).toEqual(0);

    wrapper.find('.jest-login-button').simulate('click');
    theForm = wrapper.find('.jest-auth-form').at(0);
    expect(theForm.find('.jest-social-auth').length).toEqual(0);
  });
});
