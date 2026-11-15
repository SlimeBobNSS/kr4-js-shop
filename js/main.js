const memoryStorage = {};

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return memoryStorage[key] || null;
  }
}

function writeStorage(key, value) {
  memoryStorage[key] = value;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
  }
}

function formatPrice(value) {
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

// Практическая №15: отдельно размер скидки и окончательная цена.
function calculateDiscount(price, discountPercent) {
  return price * discountPercent / 100;
}

function calculateFinalPrice(price, discountPercent) {
  return price - calculateDiscount(price, discountPercent);
}

function getDiscountPrice(product) {
  return Math.round(calculateFinalPrice(product.price, product.discountPercent));
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function getAvailabilityLabel(product) {
  return product.isAvailable ? 'Доступен' : 'Временно недоступен';
}

function createProductSummary(product) {
  return product.title + ' — ' + formatPrice(getDiscountPrice(product)) + ' (' + getProductStatus(product) + ')';
}

function getShortDescription(product) {
  return product.location + ' · ' + product.dates + ' · ' + product.categoryLabel;
}

// Практическая №16: функции обработки массива товаров.
function getProductTitles(productList) {
  return productList.map((product) => product.title);
}

function getAvailableProducts(productList) {
  return productList.filter((product) => product.isAvailable);
}

function searchProducts(productList, query) {
  const normalized = query.trim().toLowerCase();
  return productList.filter((product) => product.title.toLowerCase().includes(normalized));
}

function filterProductsByCategory(productList, category) {
  return category === 'all' ? productList : productList.filter((product) => product.category === category);
}

function sortProductsByPrice(productList, direction = 'asc') {
  const copy = [...productList];
  return copy.sort((a, b) => direction === 'desc' ? b.price - a.price : a.price - b.price);
}

function findProductById(productList, id) {
  return productList.find((product) => product.id === id);
}

function findProduct(id) {
  return findProductById(products, id);
}

function calculateTotalPrice(productList) {
  return productList.reduce((sum, product) => sum + product.price, 0);
}

function countAvailableProducts(productList) {
  let count = 0;
  for (const product of productList) {
    if (product.isAvailable) count += 1;
  }
  return count;
}

function calculateAveragePrice(productList) {
  if (productList.length === 0) return 0;
  let sum = 0;
  for (let index = 0; index < productList.length; index += 1) {
    sum += productList[index].price;
  }
  return sum / productList.length;
}

function prepareProducts(productList, query = '', category = 'all', direction = 'asc') {
  const matches = searchProducts(productList, query);
  const inCategory = filterProductsByCategory(matches, category);
  return sortProductsByPrice(inCategory, direction);
}

// Статистика на сайте выводится безопасно через textContent.
document.querySelectorAll('[data-products-stats]').forEach((element) => {
  element.textContent = 'Всего билетов: ' + products.length +
    ' · В наличии: ' + countAvailableProducts(products) +
    ' · Средняя цена: ' + formatPrice(calculateAveragePrice(products));
});

function showMessage(selector, message, isError = false) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = message;
  element.hidden = !message;
  element.classList.toggle('is-error', isError);
}

function createTextElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  element.textContent = value;
  return element;
}

const navToggle = document.querySelector('.site-nav-toggle');
const mobileNav = document.querySelector('#mobile-site-nav');

if (navToggle && mobileNav) {
  function closeMobileNav(restoreFocus = false) {
    mobileNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
    if (restoreFocus) navToggle.focus();
  }

  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    mobileNav.classList.toggle('is-open', !isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMobileNav());
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMobileNav(true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 960) closeMobileNav();
  });
}
