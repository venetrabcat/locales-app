// Рендер локалей из /api/locales в таблицу.
// Язык по умолчанию — ru. Логика переключения RU/EN — на M5.

const LANG = 'ru';
const tableBody = document.querySelector('.locales tbody');
const searchInput = document.querySelector('.search');

let locales = [];

// Флаг через flag-icons: класс fi fi-<ISO 3166 alpha-2>
function flagFor(locale) {
  const span = document.createElement('span');
  span.className = `fi fi-${locale.countryCode.toLowerCase()} flag`;
  span.title = locale.country[LANG];
  return span;
}

// Пустое значение (undefined/null/'') → «—» (M3)
function cellText(value) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  return value;
}

function renderRows(list) {
  tableBody.innerHTML = '';

  for (const locale of list) {
    const tr = document.createElement('tr');

    const tdFlag = document.createElement('td');
    tdFlag.appendChild(flagFor(locale));
    tr.appendChild(tdFlag);

    const tdCode = document.createElement('td');
    tdCode.className = 'code';
    tdCode.textContent = locale.code;
    tr.appendChild(tdCode);

    const textCells = [
      locale.language[LANG],
      locale.country[LANG],
      locale.currency,
      locale.tld,
      locale.capital,
      locale.timezones[0],
    ];

    for (const value of textCells) {
      const td = document.createElement('td');
      td.textContent = cellText(value);
      tr.appendChild(td);
    }

    tableBody.appendChild(tr);
  }
}

// Функциональный поиск: фильтр по коду, стране или языку (M2 дополнение)
function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderRows(locales);
    return;
  }

  const filtered = locales.filter((locale) => {
    return (
      locale.code.toLowerCase().includes(query) ||
      locale.country[LANG].toLowerCase().includes(query) ||
      locale.language[LANG].toLowerCase().includes(query)
    );
  });

  renderRows(filtered);
}

async function loadLocales() {
  try {
    const response = await fetch('/api/locales');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    locales = await response.json();
    renderRows(locales);
  } catch (error) {
    // Обработка ошибок с сообщением пользователю — на M5.
    console.error('Не удалось загрузить локали:', error);
  }
}

searchInput.addEventListener('input', applySearch);
loadLocales();
