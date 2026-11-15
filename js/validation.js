function validateInput(input) {
  if (!input.willValidate) return true;
  input.setCustomValidity('');
  const value = input.value.trim();
  let message = '';
  if (input.validity.valueMissing) {
    message = input.type === 'checkbox' ? 'Нужно подтвердить согласие.' : 'Заполните это поле.';
  } else if (input.validity.typeMismatch) {
    message = 'Проверьте формат электронной почты.';
  } else if (input.validity.tooShort || (input.name === 'name' && value.length < 2)) {
    message = 'Введите минимум 2 символа.';
  } else if (input.name === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) message = 'Введите телефон из 10–15 цифр.';
  }
  input.setCustomValidity(message);
  input.setAttribute('aria-invalid', String(Boolean(message)));
  const errorElement = document.querySelector('#' + input.id + '-error');
  if (errorElement) errorElement.textContent = message;
  return !message && input.checkValidity();
}

function attachFormValidation(formId, statusSelector) {
  const form = document.querySelector(formId);
  if (!form) return;
  const fields = Array.from(form.querySelectorAll('input, select, textarea'));
  fields.forEach((input) => {
    input.addEventListener('input', () => {
      validateInput(input);
      showMessage(statusSelector, '');
    });
    input.addEventListener('change', () => {
      validateInput(input);
      showMessage(statusSelector, '');
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    fields.forEach((input) => {
      if (!validateInput(input)) valid = false;
    });
    if (!valid) {
      showMessage(statusSelector, 'Проверьте выделенные поля формы.', true);
      const firstInvalid = fields.find((input) => !input.checkValidity());
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (formId === '#cart-form') {
      if (getCart().length === 0) {
        showMessage(statusSelector, 'Сначала добавьте хотя бы один билет в корзину.', true);
        return;
      }
      const finalPrice = getTotal().total;
      saveCart([]);
      writeStorage(PROMO_KEY, '');
      document.querySelector('#promo-code').value = '';
      showMessage('#promo-status', '');
      form.reset();
      fields.forEach((input) => input.removeAttribute('aria-invalid'));
      showMessage(statusSelector, 'Заявка сформирована. Итоговая сумма: ' + formatPrice(finalPrice) + '. Данные не отправлены; корзина очищена.');
      renderCart();
    } else {
      form.reset();
      fields.forEach((input) => input.removeAttribute('aria-invalid'));
      showMessage(statusSelector, formId === '#ticket-request-form'
        ? 'Запрос на подбор подготовлен. Поля проверены, но данные не отправлены на сервер.'
        : 'Поля заполнены корректно. Отправка сообщений пока недоступна.');
    }
  });
}

attachFormValidation('#cart-form', '#cart-form-status');
attachFormValidation('#contact-form', '#contact-status');
attachFormValidation('#ticket-request-form', '#ticket-request-status');
