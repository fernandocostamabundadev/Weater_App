

# 🌤️ Weather Forecast Day — README

**Um site moderno, responsivo e animado** (HTML + CSS + JavaScript puro) que mostra a **previsão dos próximos 5 dias** para qualquer local informado (cidade, estado, país ou CEP), com **fundo de nuvens em movimento**, **cards elegantes** e **botões de compartilhamento**.
Desenvolvido por **Dev Pamela M.S**.

---

## ✨ Destaques

* 🎯 **5 dias de previsão** (máx/mín, vento, umidade, condição com emoji)
* 🌥️ **Fundo animado** com nuvens se movendo suavemente
* 📱 **Totalmente responsivo** (desktop, tablet e celular)
* ⚡ **Leve e rápido**: HTML + CSS + JS puro, sem frameworks pesados
* 📤 **Compartilhar**: Facebook, WhatsApp e **Copiar Link**
* 🧭 **Busca por local** (cidade/estado/país/CEP) com **tratamento de erros**
* 🌀 **Spinner** de carregamento e **transições suaves** nos cards

---

## 🧠 Objetivo

Criar um site completo e animado, em português, chamado **Weather Forecast Day**, exibindo a previsão dos próximos **5 dias** para o local informado pelo usuário, com **design moderno**, **animações suaves** e **código organizado e comentado**.

---

## 📁 Estrutura de Arquivos

```text
weather-App/
├─ index.html # Estrutura base 
├─ styles.css #estilo
└─script.js   # Lógica
```

---

## 🏗️ index.html (requisitos atendidos)

* `lang="pt-BR"`
* Cabeçalho com **logo** e **título**: *Weather Forecast Day*
* **Barra de busca** (input + botão)
* Seção com **cards dos próximos 5 dias**
* `<div class="clouds"></div>` para **nuvens animadas**
* **Botões de compartilhamento** (Facebook, WhatsApp, Copiar Link)
* **Rodapé**: “Desenvolvido por **Dev Pamela M.S**”
* **Comentários HTML** explicativos `<!-- início: ... -->`

---

## 🎨 styles.css (requisitos atendidos)

* Paleta em **tons de azul** (`--primary-blue`, `--accent-light`)
* **Nuvens animadas** com `@keyframes` + `animation`
* **Transições suaves** (fade/slide) para os cards
* **Sombra suave**, **bordas arredondadas**, **tipografia moderna**
* **Botões sociais** estilizados com hover
* **Responsividade total**
* **Spinner de carregamento** com `@keyframes spin`
* **Variáveis CSS** para facilitar customização

---

## ⚙️ script.js (requisitos atendidos)

* `fetchWeather(location)`: consulta a API (ex.: **OpenWeatherMap**)
* `renderForecast(data)`: monta e exibe os **cards dos 5 dias**
* `mapWeatherToEmoji(code)`: traduz condição climática → emoji

  * ☀️ Sol | ⛅ Parcialmente nublado | ☁️ Nublado | 🌧️ Chuva | ⚡ Tempestade | ❄️ Frio/Neve
* `initShareButtons()`: ativa compartilhamento

  * **Facebook** → `https://www.facebook.com/sharer.php?u=URL`
  * **WhatsApp** → `https://wa.me/?text=Veja a previsão em URL`
  * **Copiar Link** → `navigator.clipboard.writeText()`
* **Tratamento de erros**: “Local não encontrado” / “Sem conexão”
* **Estado de carregamento**: “Carregando... ⏳”
* **Comentários JS** em pontos críticos (busca API, render, erros, etc.)

---

## 🔧 Como rodar localmente

1. **Clone** este repositório:

   ```bash
   git clone https://github.com/<seu-usuario>/<seu-repo>.git
   cd <seu-repo>
   ```
2. Crie uma **chave da API** no [OpenWeatherMap](https://openweathermap.org/api) (gratuito).
3. No `script.js`, defina sua chave:

   ```js
   const OPEN_WEATHER_KEY = "SUA_CHAVE_AQUI";
   ```

   > Dica: você pode também ler de `localStorage` ou usar uma `.env` com bundlers, mas aqui manteremos **JS puro**.
4. Abra o `index.html` no navegador (ou use a extensão **Live Server** no VS Code).

---

## 🌐 API utilizada

* **OpenWeatherMap 5 day / 3 hour Forecast**
  Endpoint base: `https://api.openweathermap.org/data/2.5/forecast`
  Parâmetros principais:

  * `q`: local (ex.: `q=São Paulo,BR`)
  * `appid`: sua **API key**
  * `units=metric`: °C
  * `lang=pt_br`: textos em português

**Exemplo de URL**:

```
https://api.openweathermap.org/data/2.5/forecast?q=São Paulo,BR&units=metric&lang=pt_br&appid=SUA_CHAVE
```

---

## ▶️ Uso

* Digite **cidade/estado/país/CEP** na barra de busca e clique em **Buscar**.
* Veja os **cards dos próximos 5 dias** com **emoji**, **máx/mín**, **vento** e **umidade**.
* Compartilhe a página pelos botões de **Facebook**, **WhatsApp** ou **Copiar Link**.

---

## 🧩 Mapeamento de Condições → Emoji

| Condição (código OWM)  | Emoji | Regra (exemplo)        |
| ---------------------- | ----: | ---------------------- |
| Clear (800)            |    ☀️ | Céu limpo              |
| Clouds (801–804)       |  ⛅/☁️ | Poucas → muitas nuvens |
| Drizzle/Rain (3xx/5xx) |   🌧️ | Chuviscos/chuva        |
| Thunderstorm (2xx)     |     ⚡ | Tempestade             |
| Snow (6xx)             |    ❄️ | Neve/Frio              |
| Mist/Haze (7xx)        |    ☁️ | Névoa/névoa seca, etc. |

> Observação: o código implementa uma **heurística simples** por grupo/classe de condição.

---

## 📲 Compartilhamento (links usados)

* **Facebook**: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`
* **WhatsApp**: `https://wa.me/?text=${encodeURIComponent('Veja a previsão em ' + url)}`
* **Copiar Link**: `navigator.clipboard.writeText(url)`

---

## 🧪 Acessibilidade & UX

* Ícones com `aria-label` quando necessário
* Contraste adequado em textos e botões
* Foco visível ao navegar por teclado
* Mensagens claras de erro e carregamento

---

## 🚀 Deploy (GitHub Pages)

1. Faça **commit/push** do projeto.
2. Em **Settings → Pages**, selecione a branch (ex.: `main`) e a pasta (`/root`).
3. Aguarde a URL pública e compartilhe ✨

---

## 🔍 Troubleshooting

* **“Local não encontrado”**: verifique a grafia (ex.: `São Paulo,BR`)
* **Sem previsão**: confira sua **API key** e limite de requisições
* **Sem internet**: o app mostra “Sem conexão” e permite tentar novamente
* **CORS**: abra via **Live Server** ou hospede (GitHub Pages resolve)

---

## 🗺️ Roadmap (ideias futuras)

* 📍 **Geolocalização** do usuário (HTML5 Geolocation API)
* ⭐ **Favoritos** (salvar locais no `localStorage`)
* 🕒 **Previsão horária** e gráficos simples (temperatura/chuva)
* 🌓 **Tema claro/escuro** (toggle)
* 🌐 **i18n** (en/es)

---

## 🤝 Contribuindo

1. Faça um **fork**
2. Crie sua **feature branch**: `git checkout -b feat/minha-ideia`
3. **Commit**: `git commit -m "feat: minha ideia"`
4. **Push**: `git push origin feat/minha-ideia`
5. Abra um **Pull Request**

---

## 📝 Licença

Este projeto está sob a licença **MIT**.
Sinta-se livre para usar e aprimorar.

---

## 👩‍💻 Créditos

**Desenvolvido por Dev Pamela M.S** — *“Sua visão, nossa tecnologia.”*

* 🌐 **Site/Portfólio**: devpamelams.com.br
* ✉️ **E-mail**: [eng.pamelams@gmail.com](mailto:eng.pamelams@gmail.com)
* 📱 **WhatsApp**: (11) 94583-5660 / (11) 91477-8911
* 📸 **Instagram**: @devpamelams

---

## ✅ Checklist de Requisitos

* [x] HTML, CSS e JS **puros**
* [x] **Nuvens animadas** com `@keyframes`
* [x] **Previsão 5 dias** (máx/mín, vento, umidade, emoji)
* [x] **Transições suaves** (fade/slide)
* [x] **Spinner** de carregamento
* [x] **Botões de compartilhar** (Facebook/WhatsApp/Copiar)
* [x] **Responsivo** e **com acessibilidade**
* [x] **Tratamento de erros** claro
* [x] Código **limpo, comentado e organizado**
* [x] Pronto para edição no **VS Code** e **deploy** no GitHub Pages

---

> **Observação de uso da API:** Este projeto utiliza dados do **OpenWeatherMap**. Respeite os **termos de uso** e limites de requisições do serviço.
