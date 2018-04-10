import fetchMock from 'fetch-mock';
import { UserFactory } from 'frontend/fixtures/users';
import { WalletFactory } from 'frontend/fixtures/payments';
import { mountRoute } from 'frontend/utils/mount';


describe('Payment page with user subscription', () => {
  const userWithBothSubscriptions = UserFactory.build();
  const userWithProSubscription = UserFactory.build({
    subscription_pro_active_till: '2021-06-28T23:59:59.999999',
    subscription_standard_active_till: '2021-06-28T23:59:59.999999',
  });
  const userWithStandardSubscription = UserFactory.build({
    subscription_pro_active_till: null,
  });
  const userWithOutdatedStandardSubscription = UserFactory.build({
    subscription_pro_active_till: null,
    subscription_standard_active_till: '1889-04-20T23:59:59.999999',
  });
  const defaultPriceMatrix = {
    pro: {
      1: {
        full_price: 379,
        advert_price_for_user: 379,
      },
      3: {
        full_price: 1090,
        advert_price_for_user: 1090,
      },
      12: {
        full_price: 3790,
        advert_price_for_user: 3790,
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
  const priceMatrixForUpdatingSubscriptions = {
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

  afterEach(() => {
    fetchMock.restore();
  });

  test('user with both subscriptions buy standard', async() => {
    fetchMock.get('/api/prices/', {
      body: priceMatrixForUpdatingSubscriptions,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithBothSubscriptions] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text()).toContain('Подписка активна до 2 марта 2022');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    standardSubscriptionType.simulate('click');

    expect(wrapper.find('.jest-payments-subscription-header').text())
      .toContain('Стандартная подписка активна до 2 марта 2022');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
  });

  test('user with both subscriptions buy pro', async() => {
    fetchMock.get('/api/prices/', {
      body: priceMatrixForUpdatingSubscriptions,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithBothSubscriptions] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');

    expect(proSubscriptionType.text()).toContain('Подписка активна до 28 июня 2021');
    expect(proSubscriptionType.text()).toContain('Купить от 180 ₽ в месяц');

    proSubscriptionType.simulate('click');
    expect(wrapper.find('.jest-payments-subscription-header').text())
      .toContain('Премиум-подписка активна до 28 июня 2021');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
  });

  test('user with both subscriptions and rebill standard buy standard', async() => {
    const walletsWithRebillStandard = [
      WalletFactory.build({
        id: 100,
        is_deactivatable: false,
        method: 'iTunes',
        next_rebill_date: '2018-05-19',
        slug: 'itunes',
        subscription_type: 'standard',
      }),
    ];

    fetchMock.get('/api/prices/', {
      body: priceMatrixForUpdatingSubscriptions,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithBothSubscriptions] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: walletsWithRebillStandard },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');
    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');

    expect(standardSubscriptionType.text()).toContain('Подписка активна до 2 марта 2022');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    expect(proSubscriptionType.text()).toContain('Подписка активна до 28 июня 2021');
    expect(proSubscriptionType.text()).toContain('Купить от 180 ₽ в месяц');

    standardSubscriptionType.simulate('click');

    const subscriptionTypeHeader = wrapper.find('.jest-payments-subscription-header');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
    expect(subscriptionTypeHeader.text()).toContain('Внимание!У вас уже есть активированные подписки!');
    expect(subscriptionTypeHeader.text()).toContain('Управление подписками');
  });

  test('user with both subscriptions and rebill pro buy pro', async() => {
    const walletsWithRebillPro = [
      WalletFactory.build({
        id: 100,
        is_deactivatable: false,
        method: 'iTunes',
        next_rebill_date: '2019-09-13',
        slug: 'itunes',
        subscription_type: 'pro',
      }),
    ];

    fetchMock.get('/api/prices/', {
      body: priceMatrixForUpdatingSubscriptions,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithBothSubscriptions] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: walletsWithRebillPro },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');

    expect(proSubscriptionType.text()).toContain('Подписка активна до 28 июня 2021');
    expect(proSubscriptionType.text()).toContain('Купить от 180 ₽ в месяц');

    proSubscriptionType.simulate('click');

    const subscriptionTypeHeader = wrapper.find('.jest-payments-subscription-header');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
    expect(subscriptionTypeHeader.text()).toContain('Внимание!У вас уже есть активированные подписки!');
    expect(subscriptionTypeHeader.text()).toContain('Управление подписками');
  });

  test('user with pro subscription buy standard', async() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithProSubscription] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');
    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text())
      .toContain('Так как у вас есть премиум, вам доступны все книги из стандарта');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    expect(proSubscriptionType.text()).toContain('Подписка активна до 28 июня 2021');
    expect(proSubscriptionType.text()).toContain('Купить от 379 ₽ в месяц');

    standardSubscriptionType.simulate('click');

    const subscriptionTypeHeader = wrapper.find('.jest-payments-subscription-header');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
    expect(subscriptionTypeHeader.text()).toContain('Так как у вас есть премиум, вам доступны все книги из стандарта');
  });

  test('user with pro subscription buy pro', async() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithProSubscription] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');
    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text())
      .toContain('Так как у вас есть премиум, вам доступны все книги из стандарта');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    expect(proSubscriptionType.text()).toContain('Подписка активна до 28 июня 2021');
    expect(proSubscriptionType.text()).toContain('Купить от 379 ₽ в месяц');

    proSubscriptionType.simulate('click');

    const subscriptionTypeHeader = wrapper.find('.jest-payments-subscription-header');
    expect(subscriptionTypeHeader.text()).toContain('Премиум-подписка активна до 28 июня 2021');
  });

  test('user with standard subscription buy standard', async() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithStandardSubscription] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');
    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text()).toContain('Подписка активна до 2 марта 2022');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    expect(proSubscriptionType.text()).toContain('Купить со скидкой за Стандарт');
    expect(proSubscriptionType.text()).toContain('Купить от 379 ₽ в месяц');

    standardSubscriptionType.simulate('click');

    const subscriptionTypeHeader = wrapper.find('.jest-payments-subscription-header');
    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(0);
    expect(subscriptionTypeHeader.text()).toContain('Стандартная подписка активна до 2 марта 2022');
    expect(subscriptionTypeHeader.text()).toContain('Докупить до Премиума');
  });

  test('user with standard subscription buy pro', async() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithStandardSubscription] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');
    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text()).toContain('Подписка активна до 2 марта 2022');
    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');

    expect(proSubscriptionType.text()).toContain('Купить со скидкой за Стандарт');
    expect(proSubscriptionType.text()).toContain('Купить от 379 ₽ в месяц');

    proSubscriptionType.simulate('click');

    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(1);
    expect(wrapper.find('.jest-payments-user-subscription-detail').length).toEqual(0);
  });

  test('user with outdated standard subscription buy standard', async() => {
    fetchMock.get('/api/prices/', {
      body: defaultPriceMatrix,
      status: 200,
    });
    fetchMock.post('/api/promocode/restore/', {
      body: {},
      status: 204,
    });
    fetchMock.get('/api/profile/', {
      body: { objects: [userWithOutdatedStandardSubscription] },
    });
    fetchMock.get('/api/wallets/', {
      body: { objects: [] },
    });

    const wrapper = mountRoute('/payments/');
    await flushPromises();
    await wrapper.update();

    const proSubscriptionType = wrapper.find('.jest-payments-pro-subscription-type');
    const standardSubscriptionType = wrapper.find('.jest-payments-standard-subscription-type');

    expect(standardSubscriptionType.text()).toContain('Купить от 199 ₽ в месяц');
    expect(wrapper.find('.jest-payments-standard-subscription-till-date').length).toEqual(0);

    expect(proSubscriptionType.text()).toContain('Купить от 379 ₽ в месяц');

    standardSubscriptionType.simulate('click');

    expect(wrapper.find('.jest-payments-subscription-header-description').length).toEqual(1);
    expect(wrapper.find('.jest-payments-user-subscription-detail').length).toEqual(0);
  });
});
