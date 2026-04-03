import './index.css';
import { enableValidation, resetValidation, disableButton, enableButton, settings } from '../scripts/validation.js';
import Api from '../utils/Api.js';
import { setButtonText } from '../utils/helpers.js';
import { initialCards } from '../utils/constants.js';

const api = new Api({
  baseUrl: 'https://around-api.en.tripleten-services.com/v1',
  headers: {
    authorization: 'd2285fbf-11cb-44ca-b5e6-58b8a56e5db3',
    'Content-Type': 'application/json'
  }
});


const modalOpenedClass = 'modal_is-opened';

function closeOnEscape(evt) {
  if (evt.key === 'Escape') {
    const openedModal = document.querySelector(`.${modalOpenedClass}`);
    closeModal(openedModal);
  }
}

function openModal(modal) {
  if (!modal) return;
  modal.__opener = document.activeElement;
  modal.classList.add(modalOpenedClass);
  setTimeout(function () {
    focusFirstDescendant(modal);
    trapFocus(modal);
    document.addEventListener('keydown', closeOnEscape);
  }, 0);
}

function closeModal(modal) {
  if (!modal) return;
  removeTrap(modal);
  modal.classList.remove(modalOpenedClass);
  document.removeEventListener('keydown', closeOnEscape);
  try {
    if (modal.__opener && typeof modal.__opener.focus === 'function') modal.__opener.focus();
  } catch (e) {
  }
}

function getFocusableElements(container) {
  return container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
}

function focusFirstDescendant(container) {
  const elems = getFocusableElements(container);
  if (elems.length) elems[0].focus();
}

function trapFocus(modal) {
  if (!modal) return;
  function handleKey(e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(getFocusableElements(modal)).filter(el => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  modal.__trapHandler = handleKey;
  modal.addEventListener('keydown', handleKey);
}

function removeTrap(modal) {
  if (!modal || !modal.__trapHandler) return;
  modal.removeEventListener('keydown', modal.__trapHandler);
  delete modal.__trapHandler;
}

const editProfileBtn = document.querySelector('.profile__edit-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = editProfileModal ? editProfileModal.querySelector('.modal__form') : null;
const editProfileNameInput = editProfileForm ? editProfileForm.querySelector('#profile-name') : null;
const editProfileAboutInput = editProfileForm ? editProfileForm.querySelector('#profile-description') : null;
const editProfileSaveBtn = editProfileForm ? editProfileForm.querySelector('.modal__save-btn') : null;
const profileNameEl = document.querySelector('.profile__name');
const profileDescriptionEl = document.querySelector('.profile__description');
const profileAvatarEl = document.querySelector('.profile__avatar');
const profileAvatarButton = document.querySelector('.profile__avatar-button');

const editAvatarModal = document.getElementById('edit-avatar-modal');
const editAvatarForm = editAvatarModal ? editAvatarModal.querySelector('.modal__form') : null;
const editAvatarInput = editAvatarForm ? editAvatarForm.querySelector('#profile-avatar') : null;
const editAvatarSaveBtn = editAvatarForm ? editAvatarForm.querySelector('.modal__save-btn') : null;

const newPostBtn = document.querySelector('.profile__add-btn');
const newPostModal = document.getElementById('new-post-modal');
const newPostForm = newPostModal ? newPostModal.querySelector('.modal__form') : null;
const newPostTitleInput = newPostForm ? newPostForm.querySelector('#post-title') : null;
const newPostImageInput = newPostForm ? newPostForm.querySelector('#post-image') : null;
const newPostSaveBtn = newPostForm ? newPostForm.querySelector('.modal__save-btn') : null;

const cardTemplate = document.getElementById('card-template') ? document.getElementById('card-template').content : null;
const cardsList = document.querySelector('.cards__list');

const imagePreviewModal = document.getElementById('image-preview-modal');
const previewImage = imagePreviewModal ? imagePreviewModal.querySelector('.modal__image') : null;
const previewCaption = imagePreviewModal ? imagePreviewModal.querySelector('.modal__caption') : null;

const deleteCardModal = document.getElementById('delete-card-modal');
const deleteCardForm = deleteCardModal ? deleteCardModal.querySelector('.modal__form') : null;
const deleteCardCancelBtn = deleteCardModal ? deleteCardModal.querySelector('.modal__cancel-btn') : null;
let selectedCard;
let selectedCardId;
let currentUserId;

(function checkCloseIconFallback() {
  try {
    const img = new Image();
    img.onload = function () {
    };
    img.onerror = function () {
      document.querySelectorAll('.modal__close').forEach(function (btn) {
        btn.classList.add('modal__close--text');
      });
    };
    img.src = 'images/x4.svg';
  } catch (e) {
    document.querySelectorAll('.modal__close').forEach(function (btn) {
      btn.classList.add('modal__close--text');
    });
  }
})();

if (editProfileBtn && editProfileModal) {
  editProfileBtn.addEventListener('click', function () {
    if (editProfileNameInput && profileNameEl) editProfileNameInput.value = profileNameEl.textContent.trim();
    if (editProfileAboutInput && profileDescriptionEl) editProfileAboutInput.value = profileDescriptionEl.textContent.trim();
    if (editProfileForm) {
      resetValidation(editProfileForm, [editProfileNameInput, editProfileAboutInput], null, settings);
      enableButton(editProfileSaveBtn, settings);
    }
    openModal(editProfileModal);
  });
}

if (editProfileForm && profileNameEl && profileDescriptionEl) {
  editProfileForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const submitButton = evt.submitter;
    const name = editProfileNameInput ? editProfileNameInput.value : '';
    const about = editProfileAboutInput ? editProfileAboutInput.value : '';

    setButtonText(submitButton, true);

    api.editUserInfo({ name, about })
      .then(function (data) {
        profileNameEl.textContent = data.name;
        profileDescriptionEl.textContent = data.about;
        closeModal(editProfileModal);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setButtonText(submitButton, false);
      });
  });
}

if (newPostBtn && newPostModal) {
  newPostBtn.addEventListener('click', function () {
    openModal(newPostModal);
  });
}

if (profileAvatarButton && editAvatarModal) {
  profileAvatarButton.addEventListener('click', function () {
    if (editAvatarInput && profileAvatarEl) editAvatarInput.value = profileAvatarEl.src;
    if (editAvatarForm) {
      resetValidation(editAvatarForm, [editAvatarInput], null, settings);
      enableButton(editAvatarSaveBtn, settings);
    }
    openModal(editAvatarModal);
  });
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteCardModal);
}

function handleLikeCard(likeButton, cardId) {
  const isLiked = likeButton.classList.contains('card__like-button_active');
  const nextIsLiked = !isLiked;
  likeButton.disabled = true;
  api.changeLikeStatus(cardId, isLiked)
    .then(function (updatedCard) {
      const updatedIsLiked = Array.isArray(updatedCard.likes)
        ? updatedCard.likes.some((user) => {
            if (!user) return false;
            if (typeof user === 'string') return user === currentUserId;
            return user._id === currentUserId || user.id === currentUserId;
          })
        : nextIsLiked;
      likeButton.classList.toggle('card__like-button_active', updatedIsLiked);
      likeButton.setAttribute('aria-pressed', updatedIsLiked);
    })
    .catch(function (err) {
      console.error(err);
    })
    .finally(function () {
      likeButton.disabled = false;
    });
}

function getCardElement(data) {
  if (!cardTemplate) return null;
  const fragment = cardTemplate.cloneNode(true);
  const cardElement = fragment.querySelector('.card');
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  const likeButton = cardElement.querySelector('.card__like-button');
  if (likeButton) {
    const isLiked = Array.isArray(data.likes)
      ? data.likes.some((user) => user._id === currentUserId)
      : false;
    likeButton.classList.toggle('card__like-button_active', isLiked);
    likeButton.setAttribute('aria-pressed', isLiked);
    likeButton.addEventListener('click', function () {
      handleLikeCard(likeButton, data._id);
    });
  }

  const deleteButton = cardElement.querySelector('.card__delete-button');
  if (deleteButton) {
    deleteButton.addEventListener('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      handleDeleteCard(cardElement, data);
    });
  }

  if (cardImage && imagePreviewModal && previewImage && previewCaption) {
    cardImage.tabIndex = 0;
    const openPreview = function () {
      previewImage.src = data.link;
      previewImage.alt = data.name;
      previewCaption.textContent = data.name;
      openModal(imagePreviewModal);
    };
    cardImage.addEventListener('click', openPreview);
    cardImage.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        openPreview();
      }
    });
  }

  return cardElement;
}

if (cardsList) {
  api.getAppInfo()
    .then(function ([cards, userInfo]) {
      currentUserId = userInfo._id;
      if (profileNameEl) profileNameEl.textContent = userInfo.name;
      if (profileDescriptionEl) profileDescriptionEl.textContent = userInfo.about;
      if (profileAvatarEl) {
        profileAvatarEl.src = userInfo.avatar;
        profileAvatarEl.alt = userInfo.name;
      }

      cards.forEach(function (item) {
        const el = getCardElement(item);
        if (el) cardsList.append(el);
      });
    })
    .catch(function (err) {
      console.error(err);
      initialCards.forEach(function (item) {
        const el = getCardElement(item);
        if (el) cardsList.append(el);
      });
    });
}

if (newPostForm) {
  newPostForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const submitButton = evt.submitter;
    const title = newPostTitleInput ? newPostTitleInput.value.trim() : '';
    const image = newPostImageInput ? newPostImageInput.value.trim() : '';

    if (title && image) {
      setButtonText(submitButton, true, 'Create', 'Saving...');

      api.addCard({ name: title, link: image })
        .then(function (newCardData) {
          const newCard = getCardElement(newCardData);
          if (newCard && cardsList) cardsList.prepend(newCard);
          newPostForm.reset();
          closeModal(newPostModal);
          disableButton(newPostSaveBtn, settings);
        })
        .catch(function (err) {
          console.error(err);
        })
        .finally(function () {
          setButtonText(submitButton, false, 'Create', 'Saving...');
        });
    }
  });
}

if (editAvatarForm && profileAvatarEl) {
  editAvatarForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const submitButton = evt.submitter;
    const avatar = editAvatarInput ? editAvatarInput.value.trim() : '';

    setButtonText(submitButton, true);

    api.editAvatar(avatar)
      .then(function (data) {
        profileAvatarEl.src = data.avatar;
        profileAvatarEl.alt = data.name;
        editAvatarForm.reset();
        closeModal(editAvatarModal);
        disableButton(editAvatarSaveBtn, settings);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setButtonText(submitButton, false);
      });
  });
}

if (deleteCardCancelBtn && deleteCardModal) {
  deleteCardCancelBtn.addEventListener('click', function () {
    closeModal(deleteCardModal);
  });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;

  setButtonText(submitButton, true, 'Delete', 'Deleting...');

  api.removeCard(selectedCardId)
    .then(function () {
      if (selectedCard) selectedCard.remove();
      closeModal(deleteCardModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch(function (err) {
      console.error(err);
    })
    .finally(function () {
      setButtonText(submitButton, false, 'Delete', 'Deleting...');
    });
}

if (deleteCardForm && deleteCardModal) {
  deleteCardForm.addEventListener('submit', handleDeleteSubmit);
}

enableValidation(settings);

const modals = document.querySelectorAll('.modal');
modals.forEach((modal) => {
  modal.addEventListener('mousedown', (evt) => {
    if (evt.target.classList.contains(modalOpenedClass)) {
      closeModal(modal);
    }
  });
  modal.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('modal__close')) {
      closeModal(modal);
    }
  });
});
