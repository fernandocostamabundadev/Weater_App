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