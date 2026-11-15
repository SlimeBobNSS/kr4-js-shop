const driversGrid = document.querySelector('[data-drivers-container]');
if (driversGrid) {
  const filters = document.querySelector('#drivers-filters');
  const favoritesKey = 'f1hub-favorite-drivers-v4';

  function getFavoriteDrivers() {
    try {
      const ids = JSON.parse(readStorage(favoritesKey) || '[]');
      return Array.isArray(ids) ? ids.filter((id) => Number.isInteger(id)) : [];
    } catch (error) {
      return [];
    }
  }

  function renderDriverCard(driver, favorites) {
    const card = createTextElement('article', 'product-card', '');
    card.classList.add('driver-card');
    card.dataset.team = driver.teamCode;
    card.append(createTextElement('p', 'driver-card__ranking', 'Место в таблице: №' + driver.rank));
    card.append(createTextElement('h3', 'product-card__title', driver.title));
    card.append(createTextElement('p', 'product-card__description', 'Команда: ' + driver.team + ' · Мотор: ' + driver.engine + ' · №' + driver.number));
    card.append(createTextElement('p', 'product-card__price', 'Очки: ' + driver.points));

    const actions = createTextElement('div', 'driver-card__actions', '');

    const favoriteButton = createTextElement('button', 'button', favorites.includes(driver.id) ? '★ В избранном' : '☆ В избранное');
    favoriteButton.classList.add('button--secondary', 'favorite-button');
    favoriteButton.type = 'button';
    favoriteButton.dataset.action = 'favorite-driver';
    favoriteButton.dataset.driverId = String(driver.id);
    favoriteButton.setAttribute('aria-pressed', String(favorites.includes(driver.id)));

    const infoLink = createTextElement('a', 'button', 'О болиде');
    infoLink.classList.add('button--secondary', 'driver-card__link');
    infoLink.href = 'product.html';

    actions.append(favoriteButton, infoLink);
    card.append(actions);
    return card;
  }

  function renderDrivers() {
    const query = filters.querySelector('#driver-search').value.trim().toLowerCase();
    const engines = Array.from(filters.querySelectorAll('input[name="pu"]:checked')).map((input) => input.value);
    const status = filters.querySelector('input[name="status"]:checked').value;
    const sorting = filters.querySelector('#driver-sort').value;
    const favoritesOnly = filters.querySelector('#driver-favorites-only').checked;
    const favorites = getFavoriteDrivers();

    const filtered = drivers.filter((driver) => {
      return driver.title.toLowerCase().includes(query) &&
        (engines.length === 0 || engines.includes(driver.engineCode)) &&
        (status === 'all' || driver.status === status) &&
        (!favoritesOnly || favorites.includes(driver.id));
    });
    const sorted = [...filtered].sort((first, second) => {
      if (sorting === 'points-asc') return first.points - second.points;
      if (sorting === 'name-asc') return first.title.localeCompare(second.title, 'ru');
      if (sorting === 'number-asc') return first.number - second.number;
      return second.points - first.points;
    });
    driversGrid.replaceChildren();
    sorted.forEach((driver) => driversGrid.append(renderDriverCard(driver, favorites)));
    document.querySelector('#drivers-empty').hidden = sorted.length > 0;
    document.querySelector('#drivers-count').textContent = 'Найдено: ' + sorted.length + ' из ' + drivers.length;
  }

  filters.addEventListener('input', renderDrivers);
  filters.addEventListener('change', renderDrivers);
  filters.addEventListener('submit', (event) => event.preventDefault());
  filters.addEventListener('reset', () => { setTimeout(renderDrivers, 0); });
  driversGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="favorite-driver"]');
    if (!button) return;
    const id = Number(button.dataset.driverId);
    const favorites = getFavoriteDrivers();
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    writeStorage(favoritesKey, JSON.stringify(next));
    renderDrivers();
    showMessage('#driver-notice', 'Избранное обновлено. Сохранено пилотов: ' + next.length + '.');
  });
  renderDrivers();
}
