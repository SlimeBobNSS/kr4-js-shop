
function getRaceSlug(race) {
  const map = {
    'Гран-при Лас-Вегаса': 'las-vegas',
    'Гран-при Катара': 'qatar',
    'Гран-при Абу-Даби': 'abu-dhabi'
  };
  return map[race] || 'default';
}

function createProductCard(product, compact = false) {
  const card = createTextElement('article', 'product-card', '');
  card.classList.add('ticket-card');
  if (product.discountPercent > 0) {
    card.append(createTextElement('span', 'ticket-badge', product.badge));
  }
  card.append(createTextElement('h3', 'product-card__title', compact ? product.categoryLabel : product.title));
  if (!compact) {
    card.append(createTextElement('p', 'product-card__description', getShortDescription(product)));
  }
  card.append(createTextElement('p', 'product-card__description', product.description));
  const currentPrice = getDiscountPrice(product);
  const price = createTextElement('p', 'product-card__price', formatPrice(currentPrice));
  if (product.discountPercent > 0) {
    const old = createTextElement('span', 'old-price', formatPrice(product.price));
    price.prepend(old);
  }
  card.append(price);
  const availability = createTextElement('p', 'availability', getAvailabilityLabel(product));
  if (!product.isAvailable) availability.classList.add('availability--out');
  card.append(availability);
  const actions = createTextElement('div', 'ticket-card__actions', '');
  const add = createTextElement('button', 'button', 'В корзину');
  add.classList.add('button--primary');
  add.type = 'button';
  add.disabled = !product.isAvailable;
  add.dataset.action = 'add-to-cart';
  add.dataset.productId = String(product.id);
  actions.append(add);
  if (document.querySelector('#ticket-dialog')) {
    const details = createTextElement('button', 'button', 'Подробнее');
    details.classList.add('button--secondary');
    details.type = 'button';
    details.dataset.action = 'ticket-details';
    details.dataset.productId = String(product.id);
    actions.append(details);
  }
  card.append(actions);
  return card;
}

const featuredContainer = document.querySelector('[data-featured-tickets]');
if (featuredContainer) {
  products.filter((item) => item.category === 'grandstand').forEach((product) => {
    featuredContainer.append(createProductCard(product));
  });
}

// Один и тот же каталог товаров работает на catalog.html и order.html.
function initTicketCatalog(form) {
  const section = form.closest('section');
  const container = section.querySelector('[data-tickets-container]');
  const count = section.querySelector('[data-tickets-count]');
  const empty = section.querySelector('[data-tickets-empty]');
  const heading = section.querySelector('[data-tickets-heading]');
  const hint = section.querySelector('[data-tickets-hint]');
  const dialog = document.querySelector('#ticket-dialog');

  function renderProducts() {
    const query = form.querySelector('[data-ticket-search]').value.trim().toLowerCase();
    const category = form.querySelector('[data-ticket-category]').value;
    const sorting = form.querySelector('[data-ticket-sort]').value;
    const onlyAvailable = form.querySelector('[data-ticket-available]').checked;
    const filtered = products.filter((product) => {
      return (product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)) &&
        (category === 'all' || product.category === category) &&
        (!onlyAvailable || product.isAvailable);
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sorting === 'price-asc') return getDiscountPrice(a) - getDiscountPrice(b);
      if (sorting === 'price-desc') return getDiscountPrice(b) - getDiscountPrice(a);
      if (sorting === 'title-asc') return a.title.localeCompare(b.title, 'ru');
      return a.id - b.id;
    });
    container.replaceChildren();
    const grouped = sorting === 'default';
    container.classList.toggle('ticket-groups--flat', !grouped);
    heading.textContent = grouped ? 'Билеты по Гран-при' : 'Все билеты — единый порядок';
    hint.textContent = grouped
      ? 'Билеты объединены по Гран-при. Для сравнения всех цен выберите сортировку.'
      : 'Билеты отсортированы по всему каталогу, независимо от Гран-при.';

    if (!grouped) {
      const grid = createTextElement('div', 'products-grid', '');
      grid.classList.add('ticket-event__grid');
      sorted.forEach((item) => grid.append(createProductCard(item)));
      container.append(grid);
    } else {
      const races = [];
      products.forEach((product) => {
        if (!races.includes(product.race)) races.push(product.race);
      });
      races.forEach((race, index) => {
        const raceTickets = sorted.filter((item) => item.race === race);
        if (raceTickets.length === 0) return;

        const event = createTextElement('section', 'ticket-event', '');
        event.classList.add('ticket-event--' + getRaceSlug(race));
        const headingId = (form.id || 'tickets') + '-heading-' + (index + 1);
        event.setAttribute('aria-labelledby', headingId);
        const header = createTextElement('div', 'ticket-event__header', '');
        const description = createTextElement('div', 'ticket-event__intro', '');
        const title = createTextElement('h3', 'ticket-event__title', race);
        title.id = headingId;
        const info = createTextElement('p', 'ticket-event__meta', raceTickets[0].location + ' · ' + raceTickets[0].dates);
        description.append(title, info);
        const countLabel = createTextElement('span', 'ticket-event__count', raceTickets.length + ' ' +
          (raceTickets.length === 1 ? 'вариант' : raceTickets.length < 5 ? 'варианта' : 'вариантов'));
        header.append(description, countLabel);

        const grid = createTextElement('div', 'products-grid', '');
        grid.classList.add('ticket-event__grid');
        raceTickets.forEach((item) => grid.append(createProductCard(item, true)));
        event.append(header, grid);
        container.append(event);
      });
    }
    count.textContent = 'Найдено: ' + sorted.length + ' из ' + products.length;
    empty.hidden = sorted.length !== 0;
  }

  form.addEventListener('input', renderProducts);
  form.addEventListener('change', renderProducts);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', () => { setTimeout(renderProducts, 0); });
  if (dialog) {
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action="ticket-details"]');
      if (!button) return;
      const item = findProduct(Number(button.dataset.productId));
      if (!item) return;
      dialog.querySelector('#ticket-dialog-title').textContent = item.title;
      dialog.querySelector('#ticket-dialog-description').textContent =
        getShortDescription(item) + '. ' + item.description + '. ' + getAvailabilityLabel(item) + '.';
      dialog.querySelector('#ticket-dialog-price').textContent = 'Цена: ' + formatPrice(getDiscountPrice(item));
      const add = dialog.querySelector('#ticket-dialog-add');
      add.dataset.productId = String(item.id);
      add.disabled = !item.isAvailable;
      dialog.showModal();
    });
    dialog.querySelector('[data-close-ticket-dialog]').addEventListener('click', () => dialog.close());
    dialog.querySelector('#ticket-dialog-add').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }
  renderProducts();
}

document.querySelectorAll('[data-ticket-filters]').forEach(initTicketCatalog);
