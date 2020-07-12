import * as yup from 'yup';
import watch from './watchers';
import createForm from './components/form';

const urlSchema = yup.string().url().required();

const validateUrl = (url, feeds) => {
  try {
    urlSchema.validateSync(url);
    if (feeds.includes(url)) {
      return {
        message: 'Rss already exists',
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
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('.rss-form [name="url"]'),
    submitButton: document.querySelector('.rss-form [type="submit"]'),
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
  });
};
