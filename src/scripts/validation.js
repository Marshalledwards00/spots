const settings = {
  formSelector: '.modal__form',
  inputSelector: '.modal__input, .modal__textarea',
  submitButtonSelector: '.modal__save-btn',
  inactiveButtonClass: 'modal__save-btn_disabled',
  inputErrorClass: 'modal__input_type_error',
  errorVisibleClass: 'modal__error_visible'
};

function showInputError(form, input, errorMessage, config) {
  config = config || settings;
  const errorElement = form.querySelector(`#${input.id}-error`);
  if (errorElement) errorElement.textContent = errorMessage;
  input.setAttribute('aria-invalid', 'true');
  input.classList.add(config.inputErrorClass);
  if (errorElement) errorElement.classList.add(config.errorVisibleClass);
}

function hideInputError(form, input, config) {
  config = config || settings;
  const errorElement = form.querySelector(`#${input.id}-error`);
  if (errorElement) errorElement.textContent = '';
  input.removeAttribute('aria-invalid');
  input.classList.remove(config.inputErrorClass);
  if (errorElement) errorElement.classList.remove(config.errorVisibleClass);
}

function checkInputValidity(form, input, config) {
  config = config || settings;
  if (!input.validity.valid) {
    showInputError(form, input, input.validationMessage, config);
  } else {
    hideInputError(form, input, config);
  }
}

function toggleButtonState(inputList, button, config) {
  config = config || settings;
  if (!button) return;
  const hasInvalid = hasInvalidInput(inputList);
  button.disabled = hasInvalid;
  if (hasInvalid) {
    button.classList.add(config.inactiveButtonClass);
  } else {
    button.classList.remove(config.inactiveButtonClass);
  }
}

function hasInvalidInput(inputList) {
  return Array.from(inputList).some(i => !i.validity.valid);
}

function disableButton(button, config) {
  config = config || settings;
  if (!button) return;
  button.disabled = true;
  button.classList.add(config.inactiveButtonClass);
}

function enableButton(button, config) {
  config = config || settings;
  if (!button) return;
  button.disabled = false;
  button.classList.remove(config.inactiveButtonClass);
}

function resetValidation(form, inputList, button, config) {
  config = config || settings;
  if (!form) return;
  const inputs = Array.from(inputList || form.querySelectorAll(config.inputSelector));
  inputs.forEach(input => hideInputError(form, input, config));
  // ensure button is disabled initially
  if (button) disableButton(button, config);
}

function setEventListeners(form, config) {
  config = config || settings;
  const inputList = Array.from(form.querySelectorAll(config.inputSelector));
  const buttonElement = form.querySelector(config.submitButtonSelector);
  toggleButtonState(inputList, buttonElement, config);
  inputList.forEach(input => {
    input.addEventListener('input', () => {
      checkInputValidity(form, input, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
}

function enableValidation(config) {
  config = config || settings;
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach(form => setEventListeners(form, config));
}

export { settings, enableValidation, disableButton, enableButton, resetValidation };
