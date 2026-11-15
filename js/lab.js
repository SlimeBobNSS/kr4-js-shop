// Отдельная учебная проверка к занятиям №15–17. На основных страницах нет шумных логов.
const labMessage = document.querySelector('#lab-message');
const labResults = document.querySelector('#lab-results');
const labProduct = document.querySelector('#lab-product');

function runLabChecks() {
  const product = products[0]; // Объект товара из массива из 12 объектов.
  const names = getProductTitles(products);
  const available = getAvailableProducts(products);
  const qatarTickets = searchProducts(products, 'Катар');
  const premiumTickets = filterProductsByCategory(products, 'premium');
  const sortedAsc = sortProductsByPrice(products, 'asc');
  const productById = findProductById(products, 5);
  const combo = prepareProducts(products, 'Катар', 'premium', 'asc');

  // Операторы и ветвление, как в методичке №15.
  let discountStatus;
  if (product.isAvailable && product.discountPercent > 0) {
    discountStatus = 'Товар доступен со скидкой';
  } else if (product.isAvailable) {
    discountStatus = 'Товар доступен без скидки';
  } else {
    discountStatus = 'Товар отсутствует';
  }

  // Цикл for и for...of применяются в основных функциях calculateAveragePrice,
  // countAvailableProducts. forEach, map, filter, find, sort, reduce — в проекте.
  const initialPrice = calculateTotalPrice(products);
  const averagePrice = calculateAveragePrice(products);
  const availableCount = countAvailableProducts(products);
  const discount = calculateDiscount(product.price, product.discountPercent);
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);

  console.log('Практические №15–17: JavaScript подключён, массив продуктов загружен');
  console.log('Первый объект:', product);
  console.table(product);
  console.log('Цена:', formatPrice(product.price), 'Скидка:', discount,
    'Итог:', finalPrice, 'Статус:', getProductStatus(product));
  console.log('Описание:', createProductSummary(product));
  console.log('Условие if / else if:', discountStatus);
  console.log('getProductTitles:', names);
  console.log('getAvailableProducts:', available.length);
  console.log('searchProducts:', qatarTickets.length);
  console.log('filterProductsByCategory:', premiumTickets.length);
  console.log('sortProductsByPrice:', sortedAsc.map((item) => item.price));
  console.log('findProductById:', productById);
  console.log('calculateTotalPrice:', initialPrice);
  console.log('countAvailableProducts:', availableCount);
  console.log('calculateAveragePrice:', averagePrice);
  console.log('prepareProducts:', combo.map((item) => item.title));
  console.table(products.map((item) => ({ id: item.id, title: item.title,
    category: item.category, price: item.price, isAvailable: item.isAvailable })));

  labResults.textContent = [
    'Всего вариантов: ' + products.length,
    'Доступно: ' + availableCount,
    'Недоступно: ' + (products.length - availableCount),
    'Средняя цена: ' + formatPrice(averagePrice),
    'Общая стоимость каталога: ' + formatPrice(initialPrice),
    'Поиск «Катар»: ' + qatarTickets.length + ' варианта',
    'Премиум-категория: ' + premiumTickets.length + ' варианта',
    'Поиск + фильтрация + сортировка: ' + combo.length + ' результат',
    'Товар по id=5: ' + (productById ? productById.title : 'не найден'),
    'Минимальная исходная цена: ' + formatPrice(sortedAsc[0].price)
  ].join('\n');
  labProduct.textContent = JSON.stringify(product, null, 2);
  labMessage.textContent = 'JavaScript работает. Все результаты выведены в Console и на страницу.';
}

document.querySelector('#lab-run').addEventListener('click', runLabChecks);
runLabChecks();
