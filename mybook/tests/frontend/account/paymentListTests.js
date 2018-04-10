import fetchMock from 'fetch-mock';
import { PaymentFactory } from 'frontend/fixtures/payments';
import { UserFactory } from 'frontend/fixtures/users';
import { mountRoute } from 'frontend/utils/mount';


describe('User payments', () => {
  const user = UserFactory.build();
  const paymentFixtures = [
    {
      amount: '180.00',
      created: '2018-02-20T18:20:40.967989',
      gift: null,
      method: {
        name: 'Кредитной картой',
        slug: 'credit_card',
      },
      receipt_ofd_link: 'https://mybook.dev/r/xUdxK2g8avNjczq64pZ2yh/',
      status: 'accepted',
      standard_payed_from: '2021-06-28T23:59:59.999999',
      standard_payed_till: '2021-07-28T23:59:59.999999',
      pro_payed_from: '2021-06-28T23:59:59.999999',
      pro_payed_till: '2021-07-28T23:59:59.999999',
      subscription_type: 'pro',
      wallet: {
        safe_wallet_num: '**** 1111',
      },
    },
    {
      amount: '199.00',
      created: '2017-07-27T16:24:04.656041',
      gift: null,
      method: {
        name: 'InPlat MK',
        slug: 'inplatmk',
      },
      receipt_ofd_link: 'https://mybook.dev/r/riwyUWxHtDeLUcqgX7PS8m/',
      status: 'accepted',
      standard_payed_from: '2022-06-02T23:59:59.999999',
      standard_payed_till: '2022-07-02T23:59:59.999999',
      subscription_type: 'standard',
      wallet: {
        safe_wallet_num: '+777...7777',
      },
    },
    {
      amount: '0.00',
      created: '2018-02-07T18:46:45.330508',
      gift: null,
      method: {
        name: 'Подарочный код',
        slug: 'gift',
      },
      receipt_ofd_link: null,
      status: 'accepted',
      standard_payed_from: '2021-06-28T23:59:59.999999',
      standard_payed_till: '2021-07-28T23:59:59.999999',
      subscription_type: 'standard',
      wallet: {
        safe_wallet_num: '**** 1111',
      },
    },
    {
      amount: '798.00',
      created: '2017-07-25T14:04:07.098426',
      gift: {
        code: '655788d4-c86c-47cb-886f-4a3a45b4b576',
      },
      method: {
        name: 'Кредитной картой',
        slug: 'credit_card',
      },
      receipt_ofd_link: 'https://mybook.dev/r/Fouzo3WgWcWKqCv4aNQhnN/',
      status: 'accepted',
      subscription_type: 'pro',
      wallet: null,
    },
  ];
  const payments = paymentFixtures.map((item) => PaymentFactory.build(item));
  const paymentsWithPagination = [
    ...paymentFixtures,
    ...paymentFixtures,
    paymentFixtures[0],
    paymentFixtures[1],
  ].map((item) => PaymentFactory.build(item));

  beforeEach(() => {
    fetchMock.get('/api/profile/', {
      body: { objects: [user] },
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('Payment list', async() => {
    fetchMock.get('/api/payments/?limit=10&offset=0', {
      body: {
        meta: {
          total_count: 4,
          offset: 0,
        },
        objects: payments,
      },
      status: 200,
    });

    const wrapper = mountRoute('/account/payments/');
    await flushPromises();
    await wrapper.update();
    const paymentList = wrapper.find('.jest-payment-list').at(0);
    const subscriptions = wrapper.find('.jest-payment-data');
    expect(paymentList.length).toEqual(1);
    expect(subscriptions.length).not.toEqual(0);

    // Premium subscription by credit card
    const premiumSubscriptionData = subscriptions.at(0).text();
    expect(premiumSubscriptionData).toContain('Премиум-подписка');
    expect(premiumSubscriptionData).toContain('Дата оплаты20 февраля 2018 (18:20)');
    expect(premiumSubscriptionData).toContain('Период активности подписки28 июня 2021 — 28 июля 2021');
    expect(premiumSubscriptionData).toContain('Способ оплатыКарта **** 1111');
    expect(premiumSubscriptionData).toContain('Сумма180 ₽');
    expect(premiumSubscriptionData).toContain('Кассовый чек');

    // Standard subscription by sms
    const standardSubscriptionData = subscriptions.at(1).text();
    expect(standardSubscriptionData).toContain('Стандартная подписка');
    expect(standardSubscriptionData).toContain('Дата оплаты27 июля 2017 (16:24)');
    expect(standardSubscriptionData).toContain('Период активности подписки2 июня 2022 — 2 июля 2022');
    expect(standardSubscriptionData).toContain('Способ оплатыSMS +777...7777');
    expect(standardSubscriptionData).toContain('Сумма199 ₽');
    expect(standardSubscriptionData).toContain('Кассовый чек');

    // Standard subscription by gift code
    const byGiftCodeSubscriptionData = subscriptions.at(2).text();
    expect(byGiftCodeSubscriptionData).toContain('Стандартная подписка');
    expect(byGiftCodeSubscriptionData).toContain('Дата оплаты7 февраля 2018 (18:46)');
    expect(byGiftCodeSubscriptionData).toContain('Период активности подписки28 июня 2021 — 28 июля 2021');
    expect(byGiftCodeSubscriptionData).toContain('Способ оплатыПодарочный код');
    expect(byGiftCodeSubscriptionData).not.toContain('Сумма');
    expect(byGiftCodeSubscriptionData).not.toContain('Кассовый чек');

    // Premium subscription with gift by sms
    const premiumSubscriptionDataWithGift = subscriptions.at(3).text();
    expect(premiumSubscriptionDataWithGift).toContain('Премиум-подписка');
    expect(premiumSubscriptionDataWithGift).toContain('Дата оплаты25 июля 2017 (14:04)');
    expect(premiumSubscriptionDataWithGift).not.toContain('Период активности подписки');
    expect(premiumSubscriptionDataWithGift).toContain('Подарочный код655788d4-c86c-47cb-886f-4a3a45b4b576');
    expect(premiumSubscriptionDataWithGift).toContain('Способ оплатыКарта');
    expect(premiumSubscriptionDataWithGift).toContain('Сумма798 ₽');
    expect(premiumSubscriptionDataWithGift).toContain('Кассовый чек');
  });

  test('Get smoke payments list', async() => {
    fetchMock.get('/api/payments/?limit=10&offset=0', {
      body: {
        meta: {
          limit: 10,
          next: '/api/payments/?limit=10&offset=10',
          total_count: 12,
          offset: 0,
        },
        objects: paymentsWithPagination,
      },
      status: 200,
    });

    const wrapper = mountRoute('/account/payments/');
    await flushPromises();
    await wrapper.update();
    const paymentList = wrapper.find('.jest-payment-list').at(0);
    const subscriptions = wrapper.find('.jest-payment-data');
    const paymentListPagination = wrapper.find('.jest-payment-list-pagination').at(0);
    expect(paymentList.length).toEqual(1);
    expect(subscriptions.length).toEqual(10);
    expect(paymentListPagination.length).toEqual(1);
  });
});
