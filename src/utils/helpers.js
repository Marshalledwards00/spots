function setButtonText(button, isLoading, defaultText = 'Save', loadingText = 'Saving...') {
  if (!button) return;
  button.textContent = isLoading ? loadingText : defaultText;
}

export { setButtonText };