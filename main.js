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
// ===== FUNÇÃO PARA BUSCAR PREVISÃO DO TEMPO =====async function fetchWeather(location) {
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

// ===== FUNÇÃO PARA RENDERIZAR A PREVISÃO =====
function renderForecast(data, coords) {
  // Limpar mensagens de erro anteriores
  hideError();

  // Atualizar informações da localização
  const locationName = coords.admin1
    ? `${coords.name}, ${coords.admin1}, ${coords.country}`
    : `${coords.name}, ${coords.country}`;

  cityName.textContent = locationName;
  currentDate.textContent = formatDate(new Date());
  currentLocation = locationName;
  locationInfo.classList.remove("hidden");
  updateFavoriteButton();

  // Limpar cards anteriores
  forecastCards.innerHTML = "";

  // Criar cards para cada dia
  data.daily.time.forEach((date, index) => {
    const forecast = {
      date: new Date(date),
      temp_max: data.daily.temperature_2m_max[index],
      temp_min: data.daily.temperature_2m_min[index],
      feels_max: data.daily.apparent_temperature_max[index],
      feels_min: data.daily.apparent_temperature_min[index],
      weatherCode: data.daily.weathercode[index],
      windSpeed: data.daily.windspeed_10m_max[index],
      humidity: data.daily.relative_humidity_2m_max[index],
      uvIndex: data.daily.uv_index_max
        ? data.daily.uv_index_max[index]
        : undefined,
      precipProb: data.daily.precipitation_probability_max
        ? data.daily.precipitation_probability_max[index]
        : undefined,
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index],
      pressure: data.daily.surface_pressure_max
        ? data.daily.surface_pressure_max[index]
        : undefined,
    };

    const card = createForecastCard(forecast, index);
    forecastCards.appendChild(card);
  });

  // Mostrar seções
  forecastSection.classList.remove("hidden");
  shareSection.classList.remove("hidden");
}

// ===== FUNÇÃO PARA CRIAR CARD DE PREVISÃO =====
function createForecastCard(forecast, index) {
  const card = document.createElement("div");
  card.className = "forecast-card";

  const emoji = mapWeatherToEmoji(forecast.weatherCode);
  const dayName = getDayName(forecast.date, index);
  const description = getWeatherDescription(forecast.weatherCode);
  const feelsLikeText =
    forecast.feels_max && forecast.feels_min
      ? `${Math.round(forecast.feels_min)}° / ${Math.round(forecast.feels_max)}°`
      : "—";
  const uvText = forecast.uvIndex !== undefined ? `${forecast.uvIndex}` : "—";
  const precipText =
    forecast.precipProb !== undefined
      ? `${Math.round(forecast.precipProb)}%`
      : "—";
  const pressureText =
    forecast.pressure !== undefined
      ? `${Math.round(forecast.pressure)} hPa`
      : "—";

  card.tabIndex = 0;
  card.setAttribute("role", "article");
  card.setAttribute(
    "aria-label",
    `${dayName}: ${description}, máxima ${Math.round(forecast.temp_max)}°C, mínima ${Math.round(forecast.temp_min)}°C`,
  );

  card.innerHTML = `
        <div class="card-date">${dayName}</div>
        <div class="card-emoji">${emoji}</div>
        <div class="card-description">${description}</div>
        <div class="card-temp">
            <div class="temp-max">
                <span class="temp-label">Máx</span>
                <span class="temp-value">${Math.round(forecast.temp_max)}°C</span>
            </div>
            <div class="temp-min">
                <span class="temp-label">Mín</span>
                <span class="temp-value">${Math.round(forecast.temp_min)}°C</span>
            </div>
        </div>
        <div class="card-details">
            <div class="detail-item">
                <span class="detail-icon">💨</span>
                <span>${forecast.windSpeed.toFixed(1)} km/h</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">💧</span>
                <span>${Math.round(forecast.humidity)}%</span>
            </div>
        </div>
        <div class="card-extra">
            <div class="extra-item">
                <span class="extra-label">Sensação</span>
                <span>${feelsLikeText}</span>
            </div>
            <div class="extra-item">
                <span class="extra-label">UV</span>
                <span>${uvText}</span>
            </div>
            <div class="extra-item">
                <span class="extra-label">Chuva</span>
                <span>${precipText}</span>
            </div>
            <div class="extra-item">
                <span class="extra-label">Pressão</span>
                <span>${pressureText}</span>
            </div>
        </div>
        <div class="card-times">
            <div class="time-item">
                <span>Nascer</span>
                <span>${formatTime(forecast.sunrise)}</span>
            </div>
            <div class="time-item">
                <span>Pôr</span>
                <span>${formatTime(forecast.sunset)}</span>
            </div>
        </div>
    `;

  return card;
}

// ===== FUNÇÃO PARA MAPEAR CÓDIGO DO CLIMA PARA EMOJI =====
function mapWeatherToEmoji(weatherCode) {
  // Códigos baseados na WMO Weather interpretation codes
  // Referência: https://open-meteo.com/en/docs

  if (weatherCode === 0) {
    return "☀️";
  } else if (weatherCode === 1) {
    return "🌤️";
  } else if (weatherCode === 2) {
    return "⛅";
  } else if (weatherCode === 3) {
    return "☁️";
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    return "🌫️";
  } else if (weatherCode >= 51 && weatherCode <= 57) {
    return "🌧️";
  } else if (weatherCode >= 61 && weatherCode <= 67) {
    return "🌧️";
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return "❄️";
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    return "🌧️";
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    return "❄️";
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return "⚡";
  } else {
    return "🌤️";
  }
}

// ===== FUNÇÃO PARA OBTER DESCRIÇÃO DO CLIMA =====
function getWeatherDescription(weatherCode) {
  const descriptions = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Névoa",
    51: "Chuvisco leve",
    53: "Chuvisco moderado",
    55: "Chuvisco intenso",
    56: "Chuvisco congelante leve",
    57: "Chuvisco congelante intenso",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    66: "Chuva congelante leve",
    67: "Chuva congelante forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve intensa",
    77: "Grãos de neve",
    80: "Pancadas de chuva leves",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    85: "Pancadas de neve leves",
    86: "Pancadas de neve fortes",
    95: "Tempestade",
    96: "Tempestade com granizo leve",
    99: "Tempestade com granizo forte",
  };

  return descriptions[weatherCode] || "Condições variadas";
}

// ===== FUNÇÃO PARA OBTER NOME DO DIA =====
function getDayName(date, index) {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  if (index === 0) {
    return "Hoje";
  } else if (index === 1) {
    return "Amanhã";
  } else {
    return days[date.getDay()];
  }
}

// ===== FUNÇÃO PARA FORMATAR DATA =====
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("pt-BR", options);
}

function formatTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
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