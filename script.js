// script.js
const JSON_URL = "https://raw.githubusercontent.com/louishermanpaelinck/bookmarklet-apps/refs/heads/main/Iframer/code.json";
const FAVORITES_KEY = 'playyyy-favorites';

let allGamesCache = null;
let searchQuery = '';

async function loadGames() {
  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to load games", e);
    return [];
  }
}

function normalizeGameName(gameName) {
  return String(gameName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch (error) {
    console.error('Failed to read favorites', error);
    return [];
  }
}

function setFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(gameName) {
  return getFavorites().includes(gameName);
}

function toggleFavorite(gameName) {
  const favorites = getFavorites();
  const i = favorites.indexOf(gameName);
  if (i >= 0) favorites.splice(i, 1);
  else favorites.unshift(gameName);
  setFavorites(favorites);
  // update UI depending on current page
  if (document.getElementById('grid')) renderHome();
  updateGameFavoriteButton();
}

function getThumbnailCandidates(gameName) {
  const baseName = normalizeGameName(gameName);
  return [
    `images/thumbnails/${baseName}.jpg`,
    `images/thumbnails/${baseName}.jpeg`,
    `images/thumbnails/${baseName}.png`,
  ];
}

function applyThumbnailFallback(img, candidates, index = 0) {
  if (index >= candidates.length) {
    img.src = 'images/thumbnails/placeholder.jpg';
    return;
  }
  img.onerror = () => applyThumbnailFallback(img, candidates, index + 1);
  img.src = candidates[index];
}

function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'card glass';

  const link = document.createElement('a');
  link.href = `play.html?game=${encodeURIComponent(game.name)}`;

  const thumbnail = document.createElement('img');
  thumbnail.alt = game.name;
  const candidates = getThumbnailCandidates(game.name);
  applyThumbnailFallback(thumbnail, candidates);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const titleLink = document.createElement('a');
  titleLink.href = `play.html?game=${encodeURIComponent(game.name)}`;
  titleLink.textContent = game.name;
  titleLink.className = 'card-title-link';

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = `favorite-btn ${isFavorite(game.name) ? 'active' : ''}`;
  favoriteButton.setAttribute('aria-label', isFavorite(game.name) ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`);
  favoriteButton.textContent = isFavorite(game.name) ? '★' : '☆';
  favoriteButton.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(game.name);
  });

  footer.appendChild(titleLink);
  footer.appendChild(favoriteButton);

  link.appendChild(thumbnail);
  card.appendChild(link);
  card.appendChild(footer);

  return card;
}

function renderGameGrid(container, games) {
  if (!container) return;
  container.innerHTML = '';
  if (!games.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No games found.';
    container.appendChild(emptyState);
    return;
  }
  games.forEach(game => container.appendChild(createGameCard(game)));
}

// Home Page - Grid
async function renderHome() {
  if (!allGamesCache) allGamesCache = await loadGames();
  const grid = document.getElementById('grid');
  const favoritesGrid = document.getElementById('favorites-grid');

  const filteredGames = (allGamesCache || []).filter(game => game.name.toLowerCase().includes(searchQuery));
  const favoriteGames = filteredGames.filter(game => isFavorite(game.name));
  const nonFavoriteGames = filteredGames.filter(game => !isFavorite(game.name));

  renderGameGrid(favoritesGrid, favoriteGames);
  renderGameGrid(grid, nonFavoriteGames);
}

function setFavicon(href) {
  if (!href) return;
  let link = document.querySelector('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

async function renderGame() {
  const params = new URLSearchParams(window.location.search);
  const gameName = params.get('game');

  const titleEl = document.getElementById('game-title');
  if (!gameName) {
    if (titleEl) titleEl.textContent = "No game selected";
    return;
  }

  // set favicon based on game folder (normalize to avoid bad paths)
  const safeName = encodeURIComponent(normalizeGameName(gameName));
  setFavicon(`./games/${safeName}/favicon.png`);

  const games = await loadGames();
  const game = games.find(g => g.name === gameName);

  if (!game) {
    if (titleEl) titleEl.textContent = "Game not found";
    return;
  }

  if (titleEl) titleEl.textContent = game.name;
  const iframe = document.getElementById('game-iframe');
  if (iframe) iframe.src = game.url;

  const description = document.getElementById('description');
  if (description) {
    description.innerHTML = `
      <div class="game-meta">
        <div>
          Playing <strong>${game.name}</strong><br>
          Enjoy this classic browser game!<br>
          <small>Full screen recommended (F11)</small><br>
          <small>Drag this to your <a href="https://oliviagallucci.com/using-javascript-bookmarklets/#how-to-use-bookmarklets">BookmarkletsBar</a> to play these games everywhere!</small><br>
          <small>
            <a href="javascript:(function(){fetch('https://raw.githubusercontent.com/louishermanpaelinck/bookmarklet-apps/main/Iframer/no%20bookmark.js').then(r => r.text()).then(code => {const blob = new Blob([code], {type: 'application/javascript'});const blobUrl = URL.createObjectURL(blob);const s = document.createElement('script');s.src = blobUrl;s.onload = () => URL.revokeObjectURL(blobUrl);document.head.appendChild(s);}).catch(console.error);})();" id="bookmarklet-link">playyyy</a>
          </small>
        </div>
        <button id="game-favorite-btn" class="favorite-btn favorite-btn-large ${isFavorite(game.name) ? 'active' : ''}" type="button">
          ${isFavorite(game.name) ? '★ Favorite' : '☆ Add to favorites'}
        </button>
      </div>
    `;
  }

  const favoriteButton = document.getElementById('game-favorite-btn');
  if (favoriteButton) {
    favoriteButton.addEventListener('click', () => {
      toggleFavorite(game.name);
      favoriteButton.textContent = isFavorite(game.name) ? '★ Favorite' : '☆ Add to favorites';
      favoriteButton.classList.toggle('active', isFavorite(game.name));
    });
  }
}

function updateGameFavoriteButton() {
  const params = new URLSearchParams(window.location.search);
  const gameName = params.get('game');
  const favoriteButton = document.getElementById('game-favorite-btn');
  if (!gameName || !favoriteButton) return;
  favoriteButton.textContent = isFavorite(gameName) ? '★ Favorite' : '☆ Add to favorites';
  favoriteButton.classList.toggle('active', isFavorite(gameName));
}

// Auto run correct function
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('grid')) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', event => {
        searchQuery = event.target.value.toLowerCase().trim();
        renderHome();
      });
    }
    renderHome();
  } else if (document.getElementById('game-iframe')) {
    renderGame();
  }
});