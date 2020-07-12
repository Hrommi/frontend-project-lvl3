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

  const watchedState = onChange(initialState, (path) => {
    switch (path) {
      case 'form.url.valid': {
        handleUrlInput(initialState);
        break;
      }
      default: {
        break;
      }
    }
  });

  return watchedState;
};
