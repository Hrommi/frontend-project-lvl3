import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import watch from './watchers';
import parse from './parser';
import createForm from './components/form';
import createFeeds from './components/feeds';

const urlSchema = yup.string().url().required();

const validateUrl = (url, feeds) => {
  try {
    urlSchema.validateSync(url);
    if (feeds.find((feed) => feed.url === url)) {
      return {
        message: i18next.t('form.errors.exist'),
        type: 'global',
      };
    }
    return null;
  } catch (e) {
    return {
      message: e.message,
      type: 'local',
    };
  }
};

export default () => {
  const rootElement = document.getElementById('point');
  rootElement.appendChild(createForm());
  rootElement.appendChild(createFeeds());

  const state = {
    form: {
      state: 'filling',
      error: null,
      url: {
        value: '',
        valid: true,
      },
      valid: true,
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('.rss-form [name="url"]'),
    submitButton: document.querySelector('.rss-form [type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = watch(state, elements);

  elements.urlInput.addEventListener('input', (e) => {
    const { target: { value } } = e;
    watchedState.form.url.value = value;

    if (value === '') {
      watchedState.form.url.valid = true;
      return;
    }

    const error = validateUrl(watchedState.form.url.value, watchedState.feeds);
    if (error) {
      watchedState.form.url.valid = false;
    } else {
      watchedState.form.url.valid = true;
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.state = 'loading';
    watchedState.form.error = null;
    axios.get(`https://cors-anywhere.herokuapp.com/${watchedState.form.url.value}`)
      .then((response) => {
        const feed = parse(response.data);
        const feedId = uniqueId();
        watchedState.posts.push(...feed.items.map((item) => ({
          ...item,
          feedId,
        })));
        watchedState.feeds.unshift({
          id: feedId,
          title: feed.title,
          description: feed.description,
          url: watchedState.form.url.value,
        });
        watchedState.form.url.value = '';
        watchedState.form.state = 'filling';
        watchedState.form.error = null;
      })
      .catch((error) => {
        watchedState.form.state = 'failed';
        watchedState.form.error = error.message;
      });
  });
};
