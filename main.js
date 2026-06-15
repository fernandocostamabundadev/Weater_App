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