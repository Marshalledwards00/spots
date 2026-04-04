function renderLoading(isLoading, button, buttonText = 'Save', loadingText = 'Saving...') {
  if (!button) return;
  button.textContent = isLoading ? loadingText : buttonText;
}

function handleSubmit(request, evt, loadingText = 'Saving...') {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton ? submitButton.textContent : '';

  renderLoading(true, submitButton, initialText, loadingText);

  request()
    .then(() => {
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

export { renderLoading, handleSubmit };