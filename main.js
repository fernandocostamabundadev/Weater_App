//CONFIGURAÇÃO DA API OPEN-METEO (SEM CHAVE NECESSÁRIA!)
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/reverse";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast"; 
// ===== ELEMENTOS DO DOM =====
let locationInput,
  searchBtn,
  loading,
  errorMessage,
  locationInfo,
  cityName,
  currentDate,
  forecastSection,
  forecastCards,
  shareSection,
  shareFacebook,
  shareWhatsapp,
  copyLink,
  shareInstagram,
  closeShare,
  geoBtn,
  locationSuggestions,
  recentSection,
  recentButtons,
  favoritesSection,
  favoriteButtons,
  favoriteBtn;
// ===== VARIÁVEIS GLOBAIS =====
let currentLocation = "";
let recentLocations = [];
let favoriteLocations = [];
const RECENT_KEY = "weather_recent_locations";
const FAVORITES_KEY = "weather_favorite_locations";
const MAX_RECENT = 5;
const AUTOCOMPLETE_DELAY = 300;
let autocompleteTimer;
// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded — iniciando app");

  // Atribuir elementos após DOM pronto
  locationInput = document.getElementById("locationInput");
  searchBtn = document.getElementById("searchBtn");
  geoBtn = document.getElementById("geoBtn");
  locationSuggestions = document.getElementById("locationSuggestions");
  loading = document.getElementById("loading");
  errorMessage = document.getElementById("errorMessage");
  locationInfo = document.getElementById("locationInfo");
  cityName = document.getElementById("cityName");
  currentDate = document.getElementById("currentDate");
  forecastSection = document.getElementById("forecastSection");
  forecastCards = document.getElementById("forecastCards");
  shareSection = document.getElementById("shareSection");
  shareFacebook = document.getElementById("shareFacebook");
  shareWhatsapp = document.getElementById("shareWhatsapp");
  shareInstagram = document.getElementById("shareInstagram");
  copyLink = document.getElementById("copyLink");
  closeShare = document.getElementById("closeShare");
  recentSection = document.getElementById("recentSection");
  recentButtons = document.getElementById("recentButtons");
  favoritesSection = document.getElementById("favoritesSection");
  favoriteButtons = document.getElementById("favoriteButtons");
  favoriteBtn = document.getElementById("favoriteBtn");

  // checar elementos do DOM
  const missing = [];
  [
    "locationInput",
    "searchBtn",
    "geoBtn",
    "loading",
    "errorMessage",
    "locationInfo",
    "cityName",
    "currentDate",
    "forecastSection",
    "forecastCards",
    "shareSection",
    "shareFacebook",
    "shareWhatsapp",
    "shareInstagram",
    "copyLink",
    "closeShare",
    "recentSection",
    "recentButtons",
    "favoritesSection",
    "favoriteButtons",
    "favoriteBtn",
  ].forEach((id) => {
    if (!document.getElementById(id)) missing.push(id);
  });

  if (missing.length) {
    console.warn(
      "Elementos ausentes no DOM (alguns recursos podem não funcionar):",
      missing,
    );
    // não abortar totalmente — permitir continuar sem share
  }

  loadAppState();

  // Carregar previsão padrão (se função existir)
  if (typeof fetchWeather === "function") fetchWeather("São Paulo");

  // Event listeners
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      console.log("Clique em Buscar");
      try {
        handleSearch();
      } catch (err) {
        console.error(err);
        showError("Erro ao processar busca.");
      }
    });
  }

  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      requestGeolocation();
    });
  }

  if (locationInput) {
    locationInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("Enter pressionado na busca");
        handleSearch();
      }
    });
    locationInput.addEventListener("input", () => {
      const query = locationInput.value.trim();
      if (autocompleteTimer) clearTimeout(autocompleteTimer);
      if (query.length < 2) {
        if (locationSuggestions) locationSuggestions.innerHTML = "";
        return;
      }
      autocompleteTimer = setTimeout(() => {
        populateLocationSuggestions(query);
      }, AUTOCOMPLETE_DELAY);
    });
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
      toggleFavoriteLocation();
    });
  }

  // Inicializar botões de compartilhamento
  initShareButtons();

  console.log("App inicializado com sucesso");
});

// Carregar previsão padrão (se função existir)
async function getCoordinates(location) {
  const url = `${GEOCODING_API}?name=${encodeURIComponent(location)}&count=1&language=pt&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(
      "Local não encontrado. Verifique o nome da cidade e tente novamente.",
    );
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country,
    admin1: data.results[0].admin1 || "",
  };
}

async function reverseGeocode(latitude, longitude) {
  const url = `${REVERSE_GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=pt&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(
      "Não foi possível determinar a localização por coordenadas.",
    );
  }

  const place = data.results[0];
  return `${place.name}${place.admin1 ? `, ${place.admin1}` : ``}, ${place.country}`;
}

async function populateLocationSuggestions(query) {
  if (!locationSuggestions) return;
  try {
    const url = `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=6&language=pt&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      locationSuggestions.innerHTML = "";
      return;
    }

    locationSuggestions.innerHTML = data.results
      .map((item) => {
        const label = item.admin1
          ? `${item.name}, ${item.admin1}, ${item.country}`
          : `${item.name}, ${item.country}`;
        return `<option value="${label}"></option>`;
      })
      .join("");
  } catch (error) {
    console.warn("Autocomplete não disponível:", error);
  }
}

function loadAppState() {
  try {
    const recentData = window.localStorage.getItem(RECENT_KEY);
    const favoritesData = window.localStorage.getItem(FAVORITES_KEY);
    recentLocations = recentData ? JSON.parse(recentData) : [];
    favoriteLocations = favoritesData ? JSON.parse(favoritesData) : [];
  } catch (error) {
    console.warn("Erro ao carregar estado do app:", error);
    recentLocations = [];
    favoriteLocations = [];
  }
  renderAppState();
}

function saveAppState() {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentLocations));
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteLocations));
}

function renderAppState() {
  renderRecentLocations();
  renderFavoriteLocations();
}

function renderRecentLocations() {
  if (!recentButtons || !recentSection) return;
  if (recentLocations.length === 0) {
    recentSection.classList.add("hidden");
    return;
  }
  recentSection.classList.remove("hidden");
  recentButtons.innerHTML = recentLocations
    .map(
      (location) => `
        <button type="button" class="history-btn" data-location="${location}">
          ${location}
        </button>
      `,
    )
    .join("");
  recentButtons.querySelectorAll(".history-btn").forEach((button) => {
    button.addEventListener("click", () => {
      locationInput.value = button.dataset.location;
      fetchWeather(button.dataset.location);
    });
  });
}

function renderFavoriteLocations() {
  if (!favoriteButtons || !favoritesSection) return;
  if (favoriteLocations.length === 0) {
    favoritesSection.classList.add("hidden");
    return;
  }
  favoritesSection.classList.remove("hidden");
  favoriteButtons.innerHTML = favoriteLocations
    .map(
      (location) => `
        <button type="button" class="history-btn favorite-item" data-location="${location}">
          ${location}
        </button>
      `,
    )
    .join("");
  favoriteButtons.querySelectorAll(".history-btn").forEach((button) => {
    button.addEventListener("click", () => {
      locationInput.value = button.dataset.location;
      fetchWeather(button.dataset.location);
    });
  });
}

function addRecentLocation(location) {
  if (!location) return;
  const normalized = location.trim();
  recentLocations = recentLocations.filter((item) => item !== normalized);
  recentLocations.unshift(normalized);
  if (recentLocations.length > MAX_RECENT) recentLocations.pop();
  saveAppState();
  renderRecentLocations();
}

function isFavoriteLocation(location) {
  return favoriteLocations.includes(location);
}

function updateFavoriteButton() {
  if (!favoriteBtn) return;
  if (!currentLocation) {
    favoriteBtn.disabled = true;
    favoriteBtn.setAttribute("aria-pressed", "false");
    favoriteBtn.textContent = "⭐ Adicionar aos favoritos";
    return;
  }
  favoriteBtn.disabled = false;
  const active = isFavoriteLocation(currentLocation);
  favoriteBtn.setAttribute("aria-pressed", active.toString());
  favoriteBtn.textContent = active
    ? "❌ Remover dos favoritos"
    : "⭐ Adicionar aos favoritos";
}

function toggleFavoriteLocation() {
  if (!currentLocation) {
    showError("Selecione uma cidade antes de adicionar aos favoritos.");
    return;
  }
  const normalized = currentLocation.trim();
  if (isFavoriteLocation(normalized)) {
    favoriteLocations = favoriteLocations.filter((item) => item !== normalized);
  } else {
    favoriteLocations.unshift(normalized);
  }
  saveAppState();
  renderFavoriteLocations();
  updateFavoriteButton();
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    showError("Geolocalização não suportada neste navegador.");
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationName = await reverseGeocode(latitude, longitude);
        locationInput.value = locationName;
        await fetchWeather(locationName);
      } catch (geocodeError) {
        console.error(geocodeError);
        showError("Não foi possível obter sua localização. Tente novamente.");
      }
    },
    (error) => {
      console.error("Erro de geolocalização:", error);
      showError("Permissão para localização negada ou indisponível.");
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

// ===== FUNÇÃO PARA BUSCAR PREVISÃO DO TEMPO =====
async function fetchWeather(location) {
  try {
    // Mostrar loading
    showLoading();
    currentLocation = location;

    // 1. Buscar coordenadas da cidade
    const coords = await getCoordinates(location);

    // 2. Buscar previsão do tempo
    const weatherUrl = `${WEATHER_API}?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,weathercode,windspeed_10m_max,relative_humidity_2m_max,uv_index_max,precipitation_probability_max,sunrise,sunset,surface_pressure_max&timezone=auto&forecast_days=5`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(
        "Erro ao buscar previsão do tempo. Tente novamente mais tarde.",
      );
    }

    const weatherData = await weatherResponse.json();

    // 3. Renderizar a previsão
    renderForecast(weatherData, coords);
    addRecentLocation(currentLocation);
  } catch (error) {
    console.error("Erro ao buscar previsão:", error);
    showError(`❌ ${error.message}`);
  } finally {
    hideLoading();
  }
}
// = FUNÇÃO PARA BUSCAR COORDENADAS DE UMA CIDADE 
// ===== FUNÇÃO PARA BUSCAR PREVISÃO DO TEMPO =====
// ===== FUNÇÃO PARA RENDERIZAR A PREVISÃO =====
// ===== FUNÇÃO PARA CRIAR CARD DE PREVISÃO =====
// = FUNÇÃO PARA MAPEAR CÓDIGO DO CLIMA PARA EMOJI =
// ===== FUNÇÃO PARA OBTER DESCRIÇÃO DO CLIMA =====
// ===== FUNÇÃO PARA OBTER NOME DO DIA =====
// ===== FUNÇÃO PARA FORMATAR DATA =====
// ===== FUNÇÃO PARA CAPITALIZAR TEXTO =====
// ===== FUNÇÃO PARA LIDAR COM A BUSCA =====
// ===== FUNÇÕES DE CONTROLE DE INTERFACE =====
// = FUNÇÃO PARA INICIALIZAR BOTÕES DE COMPARTILHAMENTO =
// fechar ao clicar fora (simples)