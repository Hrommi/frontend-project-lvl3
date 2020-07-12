import * as yup from 'yup';
import watch from './watchers';

const createForm = () => {
  const formElement = document.createElement('form');
  formElement.classList.add('rss-form');

  const rowElement = document.createElement('div');
  rowElement.classList.add('form-row');

  const colInputElement = document.createElement('div');
  colInputElement.classList.add('col');

  const inputElement = document.createElement('input');
  inputElement.classList.add('form-control', 'form-control-lg', 'w-100');
  inputElement.setAttribute('name', 'url');
  inputElement.setAttribute('placeholder', 'RSS link');
  inputElement.setAttribute('required', true);

  const colButtonElement = document.createElement('div');
  colButtonElement.classList.add('col-auto');

  const buttonElement = document.createElement('button');
  buttonElement.classList.add('btn', 'btn-lg', 'btn-primary', 'px-sm-5');
  buttonElement.setAttribute('type', 'submit');
  buttonElement.textContent = 'Add';

  formElement.appendChild(rowElement);
  rowElement.appendChild(colInputElement);
  rowElement.appendChild(colButtonElement);
  colInputElement.appendChild(inputElement);
  colButtonElement.appendChild(buttonElement);

  return formElement;
};

const createJumbotron = () => {
  const jumbotronElement = document.createElement('section');
  jumbotronElement.classList.add('jumbotron', 'jumbotron-fluid', 'bg-dark');

  const containerElement = document.createElement('div');
  containerElement.classList.add('container-xl');

  const rowElement = document.createElement('div');
  rowElement.classList.add('row');

  const colElement = document.createElement('div');
  colElement.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');

  const headerElement = document.createElement('h1');
  headerElement.classList.add('display-3');
  headerElement.textContent = 'RSS Reader';

  const descriptionElement = document.createElement('p');
  descriptionElement.classList.add('lead');
  descriptionElement.textContent = 'Start reading RSS today! It is easy, it is nicely.';

  const formElement = createForm();

  const hintElement = document.createElement('p');
  hintElement.classList.add('text-muted', 'my-1');
  hintElement.textContent = 'Example: https://ru.hexlet.io/lessons.rss';

  jumbotronElement.appendChild(rowElement);
  rowElement.appendChild(colElement);
  colElement.appendChild(headerElement);
  colElement.appendChild(descriptionElement);
  colElement.appendChild(formElement);
  colElement.appendChild(hintElement);

  return jumbotronElement;
};

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
  const jumbotronElement = createJumbotron();
  rootElement.appendChild(jumbotronElement);

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
