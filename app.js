// Рендер локалей из /api/locales в таблицу.
// Локализация интерфейса RU/EN, обработка ошибок сети — M5.

const tableBody = document.querySelector('.locales tbody');
const tableHead = document.querySelector('.locales thead');
const searchInput = document.querySelector('.search');
const langSwitch = document.querySelector('.lang-switch');
const errorBlock = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');

let locales = [];
let LANG = 'ru'; // активный язык интерфейса (M5)

// Состояние сортировки (M4)
let sortKey = 'code';
let sortDir = 'asc';

// Строки интерфейса (M5)
const I18N = {
  ru: {
    title: 'Справочник локалей',
    flag: 'Флаг',
    code: 'Код',
    language: 'Язык',
    country: 'Страна',
    currency: 'Валюта',
    tld: 'TLD',
    capital: 'Столица',
    timezone: 'Таймзона',
    searchPlaceholder: 'Поиск по коду, стране или языку',
    error: 'Не удалось загрузить данные. Проверьте подключение и попробуйте снова.',
    retry: 'Повторить',
    timezoneCount: 'всего',
  },
  en: {
    title: 'Locale Reference',
    flag: 'Flag',
    code: 'Code',
    language: 'Language',
    country: 'Country',
    currency: 'Currency',
    tld: 'TLD',
    capital: 'Capital',
    timezone: 'Timezone',
    searchPlaceholder: 'Search by code, country or language',
    error: 'Failed to load data. Check your connection and try again.',
    retry: 'Retry',
    timezoneCount: 'total',
  },
};

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

// Значение ячейки по ключу колонки (для рендера и сортировки)
function cellValue(locale, key) {
  switch (key) {
    case 'code':
      return locale.code;
    case 'language':
      return locale.language[LANG];
    case 'country':
      return locale.country[LANG];
    case 'currency':
      return locale.currency;
    case 'tld':
      return locale.tld;
    case 'capital':
      return locale.capital;
    case 'timezone':
      return formatTimezone(locale.timezones);
    default:
      return '';
  }
}

// Таймзона: первый элемент; индикатор при нескольких (M5)
function formatTimezone(timezones) {
  if (!Array.isArray(timezones) || timezones.length === 0) {
    return null;
  }
  const first = timezones[0];
  if (timezones.length === 1) {
    return first;
  }
  return `${first} · ${I18N[LANG].timezoneCount} ${timezones.length}`;
}

// Применение строк интерфейса к статике (заголовки, placeholder, ошибка) — M5
function applyI18n() {
  const s = I18N[LANG];
  document.title = s.title;

  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = s[el.dataset.i18n];
  }

  searchInput.placeholder = s.searchPlaceholder;
  errorMessage.textContent = s.error;
  retryBtn.textContent = s.retry;

  for (const btn of langSwitch.querySelectorAll('.lang-btn')) {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === LANG);
  }
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
    tdCode.textContent = cellValue(locale, 'code');
    tr.appendChild(tdCode);

    const textKeys = ['language', 'country', 'currency', 'tld', 'capital', 'timezone'];
    for (const key of textKeys) {
      const td = document.createElement('td');
      td.textContent = cellText(cellValue(locale, key));
      tr.appendChild(td);
    }

    tableBody.appendChild(tr);
  }
}

// Сортировка списка по sortKey/sortDir (M4)
function sortList(list) {
  const sorted = [...list].sort((a, b) => {
    const va = cellText(cellValue(a, sortKey));
    const vb = cellText(cellValue(b, sortKey));
    const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// Единый рендер: поиск → сортировка → отрисовка
function render() {
  const query = searchInput.value.trim().toLowerCase();
  let list = locales;

  if (query) {
    list = list.filter((locale) => {
      return (
        locale.code.toLowerCase().includes(query) ||
        locale.country[LANG].toLowerCase().includes(query) ||
        locale.language[LANG].toLowerCase().includes(query)
      );
    });
  }

  renderRows(sortList(list));
  updateSortIndicators();
}

// Индикатор направления в активном заголовке (▲/▼)
function updateSortIndicators() {
  for (const th of tableHead.querySelectorAll('th')) {
    const indicator = th.querySelector('.sort-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  const activeTh = tableHead.querySelector(`th[data-key="${sortKey}"]`);
  if (activeTh) {
    const indicator = document.createElement('span');
    indicator.className = 'sort-indicator';
    indicator.textContent = sortDir === 'asc' ? ' ▲' : ' ▼';
    activeTh.appendChild(indicator);
  }
}

// Клик по сортируемому заголовку (M4)
tableHead.addEventListener('click', (event) => {
  const th = event.target.closest('th[data-key]');
  if (!th) return;

  const key = th.dataset.key;
  if (key === sortKey) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = 'asc';
  }
  render();
});

// Переключение языка RU/EN (M5)
langSwitch.addEventListener('click', (event) => {
  const btn = event.target.closest('.lang-btn');
  if (!btn) return;

  const lang = btn.dataset.lang;
  if (lang === LANG) return;

  LANG = lang;
  applyI18n();
  render();
});

// Показ/скрытие блока ошибки (M5)
function showError() {
  errorBlock.hidden = false;
  tableBody.innerHTML = '';
  errorBlock.style.display = 'block';
}

function hideError() {
  errorBlock.hidden = true;
  errorBlock.style.display = 'none';
}

async function loadLocales() {
  try {
    const response = await fetch('/api/locales');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    locales = data;
    hideError();
    render();
  } catch (error) {
    console.error('Не удалось загрузить локали:', error);
    showError();
  }
}

retryBtn.addEventListener('click', loadLocales);
searchInput.addEventListener('input', render);
applyI18n();
loadLocales();
