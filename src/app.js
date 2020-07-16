import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import watch from './watchers';
import parse from './parser';

const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com';
const FETCHING_TIMEOUT = 5000;

const urlSchema = yup
  .string()
  .url(() => i18next.t('form.errors.url'))
  .required(() => i18next.t('form.errors.required'));

const validateUrl = (url, feeds) => {
  try {
    urlSchema.validateSync(url);
    if (feeds.find((feed) => feed.url === url)) {
      throw new Error(i18next.t('form.errors.exist'));
    }
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
  form.feedback.value = null;

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
      const oldPostsLinks = new Set(
        posts.filter((post) => post.feedId === feed.id).map((post) => post.link),
      );
      const differencePosts = newPosts.filter(
        (newPost) => !oldPostsLinks.has(newPost.link),
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
    form.feedback.value = null;
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
        form.feedback.value = i18next.t('form.success');
        form.feedback.type = 'success';
      })
      .catch((error) => {
        form.state = 'failed';
        form.feedback.value = error.message;
        form.feedback.type = 'danger';
      });
  } else {
    form.state = 'failed';
    form.feedback.value = urlError;
    form.feedback.type = 'danger';
  }
};

export default () => {
  const state = {
    form: {
      state: 'filling',
      url: '',
      valid: true,
      feedback: {
        value: null,
        type: 'danger',
      },
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('.rss-form [name="url"]'),
    submitButton: document.querySelector('.rss-form [type="submit"]'),
    spinner: document.querySelector('.rss-form .spinner'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = watch(state, elements);

  elements.urlInput.addEventListener('input', (e) => {
    handleUrlInput(e, watchedState);
  });

  elements.form.addEventListener('submit', (e) => {
    handleFormSubmit(e, watchedState);
  });

  setTimeout(() => fetchPosts(watchedState), FETCHING_TIMEOUT);
};
