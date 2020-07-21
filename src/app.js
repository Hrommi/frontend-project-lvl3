import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import differenceWith from 'lodash/differenceWith';
import i18next from 'i18next';
import { en, ru } from './locales';
import watch from './watchers';
import parse from './parser';

export const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com';
const FETCHING_TIMEOUT = 5000;

const feedbackMessages = {
  empty: null,
  url: 'form.errors.url',
  required: 'form.errors.required',
  exist: 'form.errors.exist',
  success: 'form.success',
};

const validateUrl = (url, feeds) => {
  const urls = feeds.map((feed) => feed.url);
  const urlSchema = yup
    .string()
    .url(feedbackMessages.url)
    .notOneOf(urls, feedbackMessages.exist)
    .required(feedbackMessages.required);
  try {
    urlSchema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const handleUrlInput = (e, state) => {
  const {
    target: { value },
  } = e;
  const { form, feeds } = state;
  form.url = value;
  form.feedback.type = feedbackMessages.empty;

  if (value === '') {
    form.valid = true;
    return;
  }

  const urlError = validateUrl(value, feeds);
  if (urlError) {
    form.valid = false;
  } else {
    form.valid = true;
  }
};

const fetchPosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map((feed) => (
    axios.get(`${CORS_PROXY_URL}/${feed.url}`).then((response) => {
      const parsedFeed = parse(response.data);
      const newPosts = parsedFeed.items.map((item) => ({
        ...item,
        feedId: feed.id,
      }));
      const oldPosts = posts.filter((post) => post.feedId === feed.id);
      const differencePosts = differenceWith(
        newPosts,
        oldPosts,
        (post1, post2) => post1.link === post2.link,
      );
      posts.unshift(...differencePosts);
    })
  ));

  Promise.all(promises).finally(() => {
    setTimeout(() => fetchPosts(state), FETCHING_TIMEOUT);
  });
};

const handleFormSubmit = (e, state) => {
  e.preventDefault();
  const { form, feeds, posts } = state;
  form.state = 'loading';
  const urlError = validateUrl(form.url, feeds);
  if (!urlError) {
    form.feedback.type = feedbackMessages.empty;
    axios
      .get(`${CORS_PROXY_URL}/${form.url}`)
      .then((response) => {
        const feed = parse(response.data);
        const feedId = uniqueId();
        posts.push(
          ...feed.items.map((item) => ({
            ...item,
            feedId,
          })),
        );
        feeds.unshift({
          id: feedId,
          title: feed.title,
          description: feed.description,
          url: form.url,
        });
        form.url = '';
        form.state = 'filling';
        form.feedback.type = feedbackMessages.success;
        form.feedback.status = 'success';
      })
      .catch((error) => {
        form.state = 'failed';
        form.feedback.type = error.message;
        form.feedback.status = 'danger';
      });
  } else {
    form.state = 'failed';
    form.feedback.type = urlError;
    form.feedback.status = 'danger';
  }
};

const handleLanguageChange = (e, state) => {
  const newLanguage = e.target.dataset.language;
  if (newLanguage === state.language) {
    return;
  }
  const { language } = state;
  language.value = newLanguage;
};

export default () => {
  const state = {
    form: {
      state: 'filling',
      url: '',
      valid: true,
      feedback: {
        type: feedbackMessages.empty,
        status: 'danger',
      },
    },
    feeds: [],
    posts: [],
    language: {
      value: 'en',
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('.rss-form [name="url"]'),
    submitButton: document.querySelector('.rss-form [type="submit"]'),
    spinner: document.querySelector('.rss-form .spinner'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    languageButtons: document.querySelectorAll('[data-language]'),
    title: document.querySelector('.title'),
    description: document.querySelector('.description'),
    hint: document.querySelector('.hint'),
  };

  i18next
    .init({
      lng: 'en',
      resources: {
        en,
        ru,
      },
    })
    .then(() => {
      const watchedState = watch(state, elements);

      elements.urlInput.addEventListener('input', (e) => {
        handleUrlInput(e, watchedState);
      });

      elements.form.addEventListener('submit', (e) => {
        handleFormSubmit(e, watchedState);
      });

      elements.languageButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          handleLanguageChange(e, watchedState);
        });
      });

      setTimeout(() => fetchPosts(watchedState), FETCHING_TIMEOUT);
    });
};
