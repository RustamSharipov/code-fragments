import fetchMock from 'fetch-mock';
import { UserFactory } from 'frontend/fixtures/users';
import { WalletFactory } from 'frontend/fixtures/payments';
import { mountRoute } from 'frontend/utils/mount';


describe('User subscription list', () => {
  const user = UserFactory.build();
  const user2 = UserFactory.build({
    subscription_pro_active_till: '2021-06-28T23:59:59.999999',
    subscription_standard_active_till: '2021-06-28T23:59:59.999999',
  });
  const wallets = [
    WalletFactory.build({
      id: 100,
      is_deactivatable: true,
      method: 'Кредитной картой',
      next_rebill_date: '2021-06-28',
      slug: 'credit_card',
      subscription_type: 'pro',
    }),
    WalletFactory.build({
      id: 200,
      is_deactivatable: false,
      method: 'InPlat',
      next_rebill_date: '2017-05-17',
      slug: 'inplat',
      subscription_type: 'pro',
    }),
    WalletFactory.build({
      id: 300,
      is_deactivatable: false,
      method: 'iTunes',
      next_rebill_date: '2018-05-19',
      slug: 'itunes',
      subscription_type: 'standard',
    }),
  ];

  beforeEach(() => {
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
      status: 200,
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: wallets },
      status: 200,
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('Deactivate rebill wallet', async() => {
    const wrapper = mountRoute('/account/subscriptions/');
    await flushPromises();
    await wrapper.update();
    const subscriptionList = wrapper.find('.jest-subscription-list');
    const someDeactivateRebillingButton = wrapper.find('.jest-deactivate-rebilling-100').at(0);

    // Has some subscriptions
    expect(subscriptionList.length).toEqual(1);

    // One of them has deactivate button
    expect(someDeactivateRebillingButton.length).toEqual(1);
    expect(someDeactivateRebillingButton.text()).toContain('Отключить автопродление');

    // Click on it and open the deactivating dialog
    someDeactivateRebillingButton.simulate('click');
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(1);

    // Click on the Cancel button and close the dialog
    wrapper.find('.jest-deactivate-rebilling-dialog-decline').at(0).simulate('click');
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(0);

    // Click the same deactivating button, open the dialog again and click accept button.
    // Something went wrong on server (500)
    fetchMock.post('/api/wallets/100/deactivate/', {
      body: {},
      status: 500,
    });
    someDeactivateRebillingButton.simulate('click');
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(1);
    wrapper.find('.jest-deactivate-rebilling-dialog-accept').at(0).simulate('click');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(0);
    expect(wrapper.text()).toContain('Ошибка сервера. Попробуйте повторить позже');

    // Next time click the same deactivating button, open the dialog again and click accept button.
    // Wallet (and it's deactivating button) will be removed
    fetchMock.restore();
    fetchMock.post('/api/wallets/100/deactivate/', {
      body: {},
      status: 200,
    });
    someDeactivateRebillingButton.simulate('click');
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(1);
    wrapper.find('.jest-deactivate-rebilling-dialog-accept').at(0).simulate('click');
    await flushPromises();
    await wrapper.update();
    expect(wrapper.find('.jest-deactivate-rebilling-dialog').length).toEqual(0);
    expect(wrapper.find('.jest-deactivate-rebilling-100').length).toEqual(0);

    // Deactivate iOS
    expect(wrapper.find('.jest-deactivate-ios').at(0).text()).toContain('Как отключить?');
  });

  test('Display subscription list with no standard wallets', async() => {
    fetchMock.restore();
    fetchMock.get('/api/profile/', {
      body: { objects: [user2] },
      status: 200,
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
      status: 200,
    });
    const wrapper = mountRoute('/account/subscriptions/');
    await flushPromises();
    await wrapper.update();
    const subscriptionList = wrapper.find('.jest-subscription-list').at(0);
    const standardSubscription = wrapper.find('.jest-subscription-data-standard');

    expect(subscriptionList.length).toEqual(1);
    expect(standardSubscription.length).toEqual(0);
  });

  test('Get smoke subscription list', async() => {
    const wrapper = mountRoute('/account/subscriptions/');
    await flushPromises();
    await wrapper.update();
    const subscriptionList = wrapper.find('.jest-subscription-list').at(0);
    const subscriptions = wrapper.find('.jest-subscription-data');

    expect(subscriptionList.length).toEqual(1);
    expect(subscriptions.length).toEqual(2);
  });
});
