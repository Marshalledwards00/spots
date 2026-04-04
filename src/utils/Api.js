class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _request(endpoint, options = {}) {
    const finalOptions = {
      headers: this._headers,
      ...options
    };

    return fetch(`${this._baseUrl}${endpoint}`, finalOptions).then((res) => this._checkResponse(res));
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(`Error: ${res.status}`);
  }

  getInitialCards() {
    return this._request('/cards');
  }

  getUserInfo() {
    return this._request('/users/me');
  }

  editUserInfo(data) {
    return this._request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        about: data.about
      })
    });
  }

  editAvatar(avatar) {
    return this._request('/users/me/avatar', {
      method: 'PATCH',
      body: JSON.stringify({
        avatar: avatar
      })
    });
  }

  removeCard(id) {
    return this._request(`/cards/${id}`, {
      method: 'DELETE'
    });
  }

  deleteCard(id) {
    return this.removeCard(id);
  }

  addCard(data) {
    return this._request('/cards', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        link: data.link
      })
    });
  }

  changeLikeStatus(id, isLiked) {
    return this._request(`/cards/${id}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT'
    });
  }

  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }
}

export default Api;