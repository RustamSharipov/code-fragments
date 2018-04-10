import fetchMock from 'fetch-mock';
import { mountRoute } from 'frontend/utils/mount';


describe('Static pages', () => {
  beforeEach(() => {
    fetchMock.get('/api/static-page/?name=about', {
      content: '<h1>О книжном клубе MyBook</h1>',
    });
    fetchMock.get('/api/static-page/?name=offer', {
      content: '<h1>Договор — публичная оферта</h1>',
    });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  test('About page', async() => {
    const wrapper = mountRoute('/about/');
    await flushPromises();

    expect(fetchMock.called()).toEqual(true);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/static-page/?name=about');
    expect(wrapper.text()).toContain('О книжном клубе MyBook');
  });

  test('Offer page', async() => {
    const wrapper = mountRoute('/about/offer/');
    await flushPromises();

    expect(fetchMock.called()).toEqual(true);
    expect(fetchMock.calls(true)[0][0]).toEqual('/api/static-page/?name=offer');
    expect(wrapper.text()).toContain('Договор — публичная оферта');
  });
});
