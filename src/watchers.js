import onChange from 'on-change';
import i18next from 'i18next';

const feedbackTypesMapping = {
  danger: 'text-danger',
  success: 'text-success',
};

const getFeedback = (feedback) => (
  typeof feedback === 'function' ? feedback() : feedback
);

export default (initialState, elements) => {
  const handleUrlInput = (state) => {
    if (state.form.valid) {
      elements.urlInput.classList.remove('is-invalid');
    } else {
      elements.urlInput.classList.add('is-invalid');
    }
  };

  const handleFeedback = (state) => {
    const { feedback } = elements;
    feedback.classList.remove('text-success', 'text-danger');
    feedback.classList.add(feedbackTypesMapping[state.form.feedback.status]);
    feedback.textContent = getFeedback(state.form.feedback.type);
  };

  const handleForm = (state) => {
    const { urlInput, submitButton, spinner } = elements;
    switch (state.form.state) {
      case 'filling': {
        urlInput.value = state.form.url;
        submitButton.removeAttribute('disabled');
        spinner.classList.add('d-none');
        break;
      }
      case 'loading': {
        submitButton.setAttribute('disabled', true);
        spinner.classList.remove('d-none');
        break;
      }
      case 'failed': {
        submitButton.removeAttribute('disabled');
        spinner.classList.add('d-none');
        break;
      }
      default: {
        throw new Error(`Unknown form state: '${state.form.state}'!`);
      }
    }
  };

  const handleFeeds = (state) => {
    const { feeds } = elements;
    const html = state.feeds
      .map((feed) => {
        const titleHtml = `<h2><a href='${feed.url}' target='_blank'>${feed.title}</a></h2>`;
        const descriptionHtml = `<p>${feed.description}</p>`;
        const feedPosts = state.posts.filter((post) => post.feedId === feed.id);
        const itemsHtml = feedPosts
          .map((post) => `<div><a href='${post.link}'>${post.title}</a></div>`)
          .join('\n');
        return `<div class="mb-4">${titleHtml}${descriptionHtml}${itemsHtml}</div>`;
      })
      .join('\n');
    feeds.innerHTML = html;
  };

  const handleLanguage = (state) => {
    const {
      urlInput,
      submitButton,
      languageButtons,
      title,
      description,
      hint,
      feedback,
    } = elements;
    languageButtons.forEach((button) => {
      button.classList.remove('active');
      if (button.dataset.language === state.language.value) {
        button.classList.add('active');
      }
    });

    i18next
      .changeLanguage(state.language.value)
      .then((t) => {
        urlInput.placeholder = t('form.placeholder');
        submitButton.textContent = t('form.button');
        title.textContent = t('form.title');
        description.textContent = t('form.description');
        hint.textContent = t(
          'form.hint',
          {
            link: 'https://ru.hexlet.io/lessons.rss',
            interpolation: { escapeValue: false },
          },
        );
        feedback.textContent = getFeedback(state.form.feedback.type);
      });
  };

  const watchedState = onChange(initialState, (path) => {
    switch (path) {
      case 'form.valid': {
        handleUrlInput(initialState);
        break;
      }
      case 'form.state': {
        handleForm(initialState);
        break;
      }
      case 'form.feedback.type':
      case 'form.feedback.status': {
        handleFeedback(initialState);
        break;
      }
      case 'feeds':
      case 'posts': {
        handleFeeds(initialState);
        break;
      }
      case 'language.value': {
        handleLanguage(initialState);
        break;
      }
      default: {
        break;
      }
    }
  });

  return watchedState;
};
