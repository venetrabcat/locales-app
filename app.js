// Рендер локалей из /api/locales в таблицу.
// Язык по умолчанию — ru. Логика переключения RU/EN — на M5.

const LANG = 'ru';
const tableBody = document.querySelector('.locales-table tbody');

function renderLocales(locales) {
  tableBody.innerHTML = '';

  for (const locale of locales) {
    const tr = document.createElement('tr');

    const cells = [
      locale.code,
      locale.flag,
      locale.language[LANG],
      locale.country[LANG],
      locale.currency,
      locale.tld,
      locale.capital,
      locale.timezones[0],
    ];

    for (const value of cells) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    }

    tableBody.appendChild(tr);
  }
}

async function loadLocales() {
  try {
    const response = await fetch('/api/locales');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const locales = await response.json();
    renderLocales(locales);
  } catch (error) {
    // Обработка ошибок с сообщением пользователю — на M5.
    console.error('Не удалось загрузить локали:', error);
  }
}

loadLocales();
