import onChange from 'on-change';

export default (initialState, elements) => {
  const handleUrlInput = (state) => {
    if (state.form.url.valid) {
      elements.urlInput.classList.remove('is-invalid');
      elements.submitButton.removeAttribute('disabled');
    } else {
      elements.urlInput.classList.add('is-invalid');
      elements.submitButton.setAttribute('disabled', true);
    }
  };

  const handleForm = (state) => {
    const { urlInput, submitButton, feedback } = elements;
    switch (state.form.state) {
      case 'filling': {
        urlInput.value = '';
        submitButton.removeAttribute('disabled');
        feedback.classList.add('text-success');
        feedback.textContent = 'Rss has been loaded';
        break;
      }
      case 'loading': {
        submitButton.setAttribute('disabled', true);
        feedback.classList.remove('text-success', 'text-danger');
        feedback.textContent = '';
        break;
      }
      case 'failed': {
        submitButton.removeAttribute('disabled');
        feedback.classList.add('text-danger');
        feedback.textContent = state.form.error;
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleFeeds = (state) => {
    const { feeds } = elements;
    const html = state.feeds.map((feed) => {
      const titleHtml = `<h2><a href="${feed.link}" target="_blank">${feed.title}</a></h2>`;
      const descriptionHtml = `<p>${feed.description}</p>`;
      const feedPosts = state.posts.filter((post) => post.feedId === feed.id);
      const itemsHtml = feedPosts
        .map((post) => (
          `<div><a href="${post.link}">${post.title}</a></div>`
        ))
        .join('\n');
      return `${titleHtml}\n${descriptionHtml}\n${itemsHtml}`;
    });
    feeds.innerHTML = html;
  };

  const watchedState = onChange(initialState, (path) => {
    console.log(path);
    switch (path) {
      case 'form.url.valid': {
        handleUrlInput(initialState);
        break;
      }
      case 'form.state': {
        handleForm(initialState);
        break;
      }
      case 'feeds': {
        handleFeeds(initialState);
        break;
      }
      default: {
        break;
      }
    }
  });

  return watchedState;
};
