import fetchMock from 'fetch-mock';
import { UserFactory } from 'frontend/fixtures/users';
import { mountRoute } from 'frontend/utils/mount';


describe('User authentication tests', () => {
  const user = UserFactory.build();

  beforeEach(() => {
    fetchMock.get('/api/dashboard/', {
      body: {
        objects: [],
        meta: {
          next: null,
        },
      },
      status: 200,
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('Authenticate user from header', async() => {
    fetchMock.get('/api/profile/', { body: '', status: 401 });
    const wrapper = mountRoute('/dashboard/');
    await flushPromises();
    await wrapper.update();

    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/dashboard/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');

    expect(wrapper.text()).toContain('Войти или зарегистрироваться');
    expect(wrapper.find('.jest-auth-link-hamburger').length).toEqual(1);
    expect(wrapper.find('.jest-auth-popup-form').length).toEqual(0);
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    let theAuthMenuButton = wrapper.find('.jest-auth-link-hamburger').at(0);
    theAuthMenuButton.simulate('click');

    expect(wrapper.find('.jest-auth-form').length).toEqual(1);

    // Social auth of login form
    const socialAuth = wrapper.find('.jest-social-auth');
    expect(socialAuth.length).toEqual(1);
    const facebookSocialButton = socialAuth.find('.jest-social-auth-Facebook');
    const vkSocialButton = socialAuth.find('.jest-social-auth-VK');
    expect(facebookSocialButton.length).toEqual(1);
    expect(facebookSocialButton.text()).toContain('Facebook');
    expect(vkSocialButton.length).toEqual(1);
    expect(vkSocialButton.text()).toContain('ВКонтакте');

    let theForm = wrapper.find('.jest-auth-form form').at(0);
    theForm.simulate('submit');
    // no request is made because form requires email and pass
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(wrapper.text()).toContain('Введите почту или телефон');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-auth-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(2);
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
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(fetchMock.lastCall(true)[0]).toEqual('/api/auth/');
    // emoji popup is not seen
    expect(wrapper.text()).not.toContain('⚠️ Пароль неправильный, чувак');
    expect(wrapper.text()).toContain('Пароль неправильный, чувак');

    // submit the form with proper password
    fetchMock.restore();
    fetchMock.post('/api/auth/', { body: {} });
    fetchMock.get('/api/profile/', { body: { objects: [user] } });
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
    expect(wrapper.text()).toContain('Александр Пушкин');
    expect(wrapper.text()).not.toContain('Войти или зарегистрироваться');
    expect(wrapper.text()).toContain('Выйти');
  });

  test('User registration from header', async() => {
    fetchMock.get('/api/profile/', { body: '', status: 401 });
    const wrapper = mountRoute('/dashboard/');
    await flushPromises();
    await wrapper.update();

    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/dashboard/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');

    expect(wrapper.text()).toContain('Войти или зарегистрироваться');
    expect(wrapper.find('.jest-auth-link-hamburger').length).toEqual(1);
    expect(wrapper.find('.jest-auth-form').length).toEqual(0);
    expect(wrapper.find('.jest-registration-form').length).toEqual(0);
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);

    let theAuthMenuButton = wrapper.find('.jest-auth-link-hamburger').at(0);
    theAuthMenuButton.simulate('click');

    let theRegistrationMenuButton = wrapper.find('.jest-registration-button').at(0);
    theRegistrationMenuButton.simulate('click');

    expect(wrapper.find('.jest-registration-form').length).toEqual(1);

    // Social auth of registration form
    const socialAuth = wrapper.find('.jest-social-auth');
    expect(socialAuth.length).toEqual(1);
    const facebookSocialButton = socialAuth.find('.jest-social-auth-Facebook');
    const vkSocialButton = socialAuth.find('.jest-social-auth-VK');
    expect(facebookSocialButton.length).toEqual(1);
    expect(facebookSocialButton.text()).toContain('Facebook');
    expect(vkSocialButton.length).toEqual(1);
    expect(vkSocialButton.text()).toContain('ВКонтакте');

    let theForm = wrapper.find('.jest-registration-form form').at(0);
    theForm.simulate('submit');
    // no request is made because form requires email and pass
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(wrapper.text()).toContain('Введите почту');
    expect(wrapper.text()).toContain('Введите пароль');

    wrapper.find('.jest-registration-email input').simulate('change', {
      target: { name: 'email', value: 'user@example.com' },
    });
    theForm.simulate('submit');
    // the form still requires password
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(wrapper.text()).not.toContain('Введите почту или телефон');
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
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(fetchMock.calls(true)[2][0]).toEqual('/api/registration/');
    expect(wrapper.text()).toContain('Такая почта уже зарегистрирована');

    // submit the form with proper password
    fetchMock.restore();
    fetchMock.post('/api/registration/', {
      body: {},
      status: 201,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });

    theForm = wrapper.find('.jest-registration-form form').at(0);

    theForm.simulate('submit');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/registration/');
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');

    // user is successfully logged in
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.text()).toContain('Александр Пушкин');
    expect(wrapper.text()).not.toContain('Войти или зарегистрироваться');
    expect(wrapper.text()).toContain('Выйти');
  });

  test('Logout user from header', async() => {
    fetchMock.get('/api/profile/', { body: { objects: [user] } });
    const wrapper = mountRoute('/dashboard/');
    await flushPromises();
    await wrapper.update();

    expect(fetchMock.calls(true).length).toEqual(2);
    expect(fetchMock.calls(true)[1][0]).toEqual('/api/profile/');
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/dashboard/');

    expect(wrapper.text()).toContain('Выйти');
    expect(wrapper.text()).toContain('Александр Пушкин');
    expect(wrapper.text()).not.toContain('Войти или зарегистрироваться');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(1);
    expect(wrapper.find('.jest-unauth-link-hamburger').length).toEqual(1);

    // hit the logout button
    fetchMock.post('/api/unauth/', { body: {} });
    let theAuthMenuButton = wrapper.find('.jest-unauth-link-hamburger').at(0);
    theAuthMenuButton.simulate('click');
    await flushPromises();
    await wrapper.update();
    expect(fetchMock.calls(true).length).toEqual(3);
    expect(fetchMock.calls(true)[2][0]).toEqual('/api/unauth/');

    // user is now unauthenticated
    expect(wrapper.text()).toContain('Войти или зарегистрироваться');
    expect(wrapper.text()).not.toContain('Выйти');
    expect(wrapper.text()).not.toContain('Александр Пушкин');
    expect(wrapper.find('.jest-header-user-icon').length).toEqual(0);
    expect(wrapper.find('.jest-unauth-link-hamburger').length).toEqual(0);
    expect(wrapper.find('.jest-auth-link-hamburger').length).toEqual(1);
  });
});
