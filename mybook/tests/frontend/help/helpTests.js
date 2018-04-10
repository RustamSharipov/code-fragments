import fetchMock from 'fetch-mock';
import { mountRoute } from 'frontend/utils/mount';


describe('Help page', () => {
  const questions = [
    {
      id: 80,
      name: 'Вопросы по веб-сайту',
      slug: 'voprosy-po-veb-sajtu',
      order: 0,
      questions: [
        {
          id: 692,
          question: 'Сохранится ли моя история чтения, если я продолжу читать с другого устройства?',
          slug: 'sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod',
          order: 0,
          created_at: '2016-05-19T10:14:39.306118',
        },
        {
          id: 693,
          question: 'На каких устройствах я могу читать?',
          slug: 'na-kakih-ustrojstvah-ya-mogu-chitat',
          order: 1,
          created_at: '2016-05-19T10:14:39.306187',
        },
        {
          id: 694,
          question: 'Как я могу добавить книгу в Мои книги?',
          slug: 'kak-ya-mogu-dobavit-knigu-v-moi-knigi-2',
          order: 2,
          created_at: '2016-05-19T10:14:39.306252',
        },
        {
          id: 691,
          question: 'Можно ли скачать файл книги на свой компьютер?',
          slug: 'mozhno-li-skachat-fajl-knigi-na-svoj-kompyuter-2',
          order: 3,
          created_at: '2016-05-19T10:14:39.306016',
        },
        {
          id: 695,
          question: 'Где найти книги, которые я начал читать?',
          slug: 'gde-najti-knigi-kotorye-ya-nachal-chitat-2',
          order: 4,
          created_at: '2016-05-19T10:14:39.306318',
        },
      ],
      created_at: '2016-05-19T10:14:39.201861',
    },
    {
      id: 81,
      name: 'Библиотека для iOS',
      slug: 'biblioteka-dlya-ios',
      order: 1,
      questions: [
        {
          id: 696,
          question: 'Как изменить шрифт, межстрочный интервал и фон в читалке?',
          slug: 'kak-izmenit-shrift-mezhstrochnyj-interval-i-fon-v',
          order: 0,
          created_at: '2016-05-19T10:14:39.666026',
        },
        {
          id: 697,
          question: 'Как читать в приложении без интернета?',
          slug: 'kak-chitat-v-prilozhenii-bez-interneta',
          order: 1,
          created_at: '2016-05-19T10:14:39.666116',
        },
        {
          id: 698,
          question: 'Как регулировать яркость экрана в читалке?',
          slug: 'kak-regulirovat-yarkost-ekrana-v-chitalke',
          order: 2,
          created_at: '2016-05-19T10:14:39.666183',
        },
      ],
      created_at: '2016-05-19T10:14:39.560598',
    },
    {
      id: 82,
      name: 'Библиотека для Android',
      slug: 'biblioteka-dlya-android',
      order: 2,
      questions: [
        {
          id: 708,
          question: 'Как регулировать яркость экрана в читалке?',
          slug: 'kak-regulirovat-yarkost-ekrana-v-chitalke-3',
          order: 2,
          created_at: '2016-05-19T10:14:40.027925',
        },
        {
          id: 709,
          question: 'Как удалить сохраненную цитату из книги?',
          slug: 'kak-udalit-sohranennuyu-citatu-iz-knigi-3',
          order: 3,
          created_at: '2016-05-19T10:14:40.027950',
        },
        {
          id: 711,
          question: 'Можно ли загрузить свою книгу?',
          slug: 'mozhno-li-zagruzit-svoyu-knigu-2',
          order: 5,
          created_at: '2016-05-19T10:14:40.028008',
        },
      ],
      created_at: '2016-05-19T10:14:39.922227',
    },
  ];
  const question = {
    id: 692,
    question: 'Сохранится ли моя история чтения, если я продолжу читать с другого устройства?',
    slug: 'sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod',
    order: 0,
    created_at: '2016-05-19T10:14:39.306118',
    answer: '<p>Да, вы сможете продолжить с того же места, где остановились. Для этого вам нужно:</p>',
    image: null,
    section_slug: 'voprosy-po-veb-sajtu',
  };

  afterEach(() => {
    fetchMock.restore();
  });

  test('Index and question pages', async() => {
    fetchMock.get('/api/faq/', {
      body: { objects: questions },
      status: 200,
    });

    const indexWrapper = mountRoute('/help/');
    await flushPromises();
    await indexWrapper.update();
    const questionContainer = indexWrapper.find('.jest-help-questions').at(0);
    const questionSections = questionContainer.find('.jest-help-question-section');

    // Whole question list is visible and have 3 sections
    expect(questionContainer.length).toEqual(1);
    expect(questionSections.length).toEqual(3);

    // Expand questions of section with more then 3 questions
    const questionSectionExpander = questionSections.at(0).find('.jest-help-question-section-expander').at(0);
    expect(questionSectionExpander.text()).toContain('Посмотреть все');
    expect(indexWrapper.find('.jest-help-question-section').at(0).find('.jest-help-question').length).toEqual(3);
    questionSectionExpander.simulate('click');
    expect(questionSectionExpander.text()).toContain('Скрыть');
    expect(indexWrapper.find('.jest-help-question-section').at(0).find('.jest-help-question').length).toEqual(5);

    // then collapse
    questionSectionExpander.simulate('click');
    expect(questionSectionExpander.text()).toContain('Посмотреть все');
    expect(questionSections.at(0).find('.jest-help-question').length).toEqual(3);

    // Show question page
    const someQuestion = indexWrapper.find('.jest-help-question-section').at(0).find('.jest-help-question').at(0);
    someQuestion.simulate('click');

    fetchMock.get('/api/faq/sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod/question/', {
      body: question,
      status: 200,
    });
    const questionWrapper = mountRoute('/help/voprosy-po-veb-sajtu/' +
                                       'sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod/');
    await flushPromises();
    await questionWrapper.update();

    expect(questionWrapper.find('.jest-help-question-title').text())
      .toContain('Сохранится ли моя история чтения, если я продолжу читать с другого устройства?');
    expect(questionWrapper.find('.jest-help-question-content').text())
      .toContain('Да, вы сможете продолжить с того же места, где остановились. Для этого вам нужно:');
  });

  test('Question page', async() => {
    fetchMock.get('/api/faq/sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod/question/', {
      body: question,
      status: 200,
    });
    const wrapper = mountRoute('/help/voprosy-po-veb-sajtu/sohranitsya-li-moya-istoriya-chteniya-esli-ya-prod/');
    await flushPromises();
    await wrapper.update();

    expect(wrapper.find('.jest-help-question-title').text())
      .toContain('Сохранится ли моя история чтения, если я продолжу читать с другого устройства?');
    expect(wrapper.find('.jest-help-question-content').text())
      .toContain('Да, вы сможете продолжить с того же места, где остановились. Для этого вам нужно:');
  });
});
