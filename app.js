// Рендер локалей из /api/locales в таблицу.
// Язык по умолчанию — ru. Логика переключения RU/EN — на M5.

const LANG = 'ru';
const tableBody = document.querySelector('.locales tbody');
const tableHead = document.querySelector('.locales thead');
const searchInput = document.querySelector('.search');

let locales = [];

// Состояние сортировки (M4)
let sortKey = 'code';
let sortDir = 'asc';

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
      return locale.timezones[0];
    default:
      return '';
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

async function loadLocales() {
  try {
    const response = await fetch('/api/locales');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    locales = await response.json();
    render();
  } catch (error) {
    // Обработка ошибок с сообщением пользователю — на M5.
    console.error('Не удалось загрузить локали:', error);
  }
}

searchInput.addEventListener('input', render);
loadLocales();
