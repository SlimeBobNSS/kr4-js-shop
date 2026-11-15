const CART_KEY = 'f1hub-cart-v4';
const PROMO_KEY = 'f1hub-promo-v4';
const PROMO_CODE = 'F1START10';

function getCart() {
  let parsed;
  try {
    parsed = JSON.parse(readStorage(CART_KEY) || '[]');
  } catch (error) {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item) => {
    return item && Number.isInteger(item.id) && Number.isInteger(item.quantity) &&
      item.quantity > 0 && item.quantity <= 20 && findProduct(item.id);
  });
}

function saveCart(cart) {
  writeStorage(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
  renderCart();
}

function updateCartCounter() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = String(count);
  });
}

function addToCart(id) {
  const product = findProduct(id);
  if (!product || !product.isAvailable) return false;
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (item) {
    if (item.quantity >= 20) return false;
    item.quantity += 1;
  } else {
    cart.push({ id: id, quantity: 1 });
  }
  saveCart(cart);
  return true;
}

function changeQuantity(id, difference) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += difference;
  saveCart(cart.filter((entry) => entry.quantity > 0 && entry.quantity <= 20));
}

function removeFromCart(id) {
  saveCart(getCart().filter((entry) => entry.id !== id));
}

function getSubtotal() {
  return getCart().reduce((sum, item) => {
    return sum + getDiscountPrice(findProduct(item.id)) * item.quantity;
  }, 0);
}

function isPromoActive() {
  return readStorage(PROMO_KEY) === PROMO_CODE;
}

function getTotal() {
  const subtotal = getSubtotal();
  const discount = isPromoActive() ? Math.round(subtotal * 0.1) : 0;
  return { subtotal: subtotal, discount: discount, total: subtotal - discount };
}

function renderCart() {
  const container = document.querySelector('[data-cart-items]');
  if (!container) return;
  const cart = getCart();
  const empty = document.querySelector('#cart-empty');
  const button = document.querySelector('#submit-cart');
  container.replaceChildren();
  if (empty) empty.hidden = cart.length > 0;
  if (button) button.disabled = cart.length === 0;

  cart.forEach((item) => {
    const product = findProduct(item.id);
    const row = createTextElement('article', 'cart-item', '');
    const details = createTextElement('div', 'cart-item__details', '');
    details.append(createTextElement('h3', 'product-card__title', product.title));
    details.append(createTextElement('p', 'product-card__description', getShortDescription(product)));
    details.append(createTextElement('p', 'product-card__price', formatPrice(getDiscountPrice(product)) + ' за билет'));
    const actions = createTextElement('div', 'cart-item__actions', '');
    const minus = createTextElement('button', 'quantity-button', '−');
    minus.type = 'button';
    minus.dataset.action = 'decrease';
    minus.dataset.productId = String(item.id);
    minus.setAttribute('aria-label', 'Уменьшить количество: ' + product.title);
    const amount = createTextElement('span', 'cart-quantity', String(item.quantity));
    amount.setAttribute('aria-label', 'Количество билетов');
    const plus = createTextElement('button', 'quantity-button', '+');
    plus.type = 'button';
    plus.dataset.action = 'increase';
    plus.dataset.productId = String(item.id);
    plus.disabled = item.quantity >= 20;
    plus.setAttribute('aria-label', 'Увеличить количество: ' + product.title);
    const remove = createTextElement('button', 'button', 'Удалить');
    remove.classList.add('button--secondary', 'button--small');
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.dataset.productId = String(item.id);
    actions.append(minus, amount, plus, remove);
    row.append(details, actions);
    container.append(row);
  });
  const total = getTotal();
  document.querySelector('#cart-subtotal').textContent = formatPrice(total.subtotal);
  document.querySelector('#cart-discount').textContent = formatPrice(total.discount);
  document.querySelector('#cart-total').textContent = formatPrice(total.total);
  const promoInput = document.querySelector('#promo-code');
  if (promoInput && isPromoActive()) promoInput.value = PROMO_CODE;
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="add-to-cart"]');
  if (!button) return;
  const id = Number(button.dataset.productId);
  const product = findProduct(id);
  if (!product) return;
  const added = addToCart(id);
  const message = added ? 'Добавлено в корзину: ' + product.title : 'Товар недоступен или достигнут лимит 20 шт.';
  const notice = button.closest('section.section')?.querySelector('[data-ticket-notice]') ||
    document.querySelector('#ticket-notice') || document.querySelector('#home-notice');
  if (notice) {
    notice.textContent = message;
    notice.hidden = false;
    notice.classList.toggle('is-error', !added);
  }
});

const cartItemsElement = document.querySelector('[data-cart-items]');
if (cartItemsElement) {
  cartItemsElement.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-product-id]');
    if (!button) return;
    const id = Number(button.dataset.productId);
    if (button.dataset.action === 'increase') changeQuantity(id, 1);
    if (button.dataset.action === 'decrease') changeQuantity(id, -1);
    if (button.dataset.action === 'remove') removeFromCart(id);
    showMessage('#cart-form-status', '');
  });
  const promoButton = document.querySelector('#apply-promo');
  promoButton.addEventListener('click', () => {
    const code = document.querySelector('#promo-code').value.trim().toUpperCase();
    if (code === PROMO_CODE) {
      writeStorage(PROMO_KEY, PROMO_CODE);
      showMessage('#promo-status', 'Промокод применён: дополнительная скидка 10%.');
    } else if (code === '') {
      writeStorage(PROMO_KEY, '');
      showMessage('#promo-status', 'Промокод отменён.');
    } else {
      writeStorage(PROMO_KEY, '');
      showMessage('#promo-status', 'Неверный промокод. Введите F1START10.', true);
    }
    renderCart();
  });
}
updateCartCounter();
renderCart();
