(function () {
  "use strict";

  const slots = Array.from(document.querySelectorAll(".slot"));
  const startScreen = document.getElementById("startScreen");
  const gameScreen = document.getElementById("gameScreen");
  const playBtn = document.getElementById("playBtn");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const changeSideBtn = document.getElementById("changeSideBtn");
  const roundPill = document.getElementById("roundPill");
  const gameGrid = document.getElementById("gameGrid");

  const drawCard = document.getElementById("drawCard");
  const playersCard = document.getElementById("playersCard");
  const finishedCard = document.getElementById("finishedCard");
  const teamCodeEl = document.getElementById("teamCode");
  const seasonCodeEl = document.getElementById("seasonCode");
  const spinHint = document.getElementById("spinHint");
  const clubTitle = document.getElementById("clubTitle");
  const clubSeason = document.getElementById("clubSeason");
  const draftInfo = document.getElementById("draftInfo");
  const searchInput = document.getElementById("searchInput");
  const playersList = document.getElementById("playersList");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const teamRatingText = document.getElementById("teamRatingText");

  const DB = Array.isArray(window.PLAYERS_DB) ? window.PLAYERS_DB : [];
  const REQUIRED_POSITIONS = ["ВРТ", "ПЗ", "ЦЗ", "ЦЗ", "ЛЗ", "ЦП", "ЦП", "ЦП", "ПП", "ФРВ", "ЛП"];
  const DEFAULT_SHIRT_COLORS = { shirt: "#2C2C45", number: "#FFFFFF" };
  // Цвета клубных футболок взяты из таблицы «таблица цвета 2.xlsx»: 1-й цвет — футболка, 2-й — номер.
  const CLUB_COLORS = {
    "ПФК «Крылья Советов»": { shirt: "#0066CC", number: "#009966" },
    "ПФК «Спартак» Нальчик": { shirt: "#C8102E", number: "#FFFFFF" },
    "ПФК «Спартак-Нальчик»": { shirt: "#C8102E", number: "#FFFFFF" },
    "РФК «Ахмат»": { shirt: "#007A3D", number: "#FFFFFF" },
    "СЦКА": { shirt: "#C8102E", number: "#002B5C" },
    "ФК «Алания»": { shirt: "#C8102E", number: "#FFCC00" },
    "ФК «Амкар»": { shirt: "#C8102E", number: "#000000" },
    "ФК «Анжи»": { shirt: "#FFCC00", number: "#007A3D" },
    "ФК «Арсенал» Тула": { shirt: "#C8102E", number: "#FFCC00" },
    "ФК «Волга» Н.Новгород": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Динамо» Москва": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Зенит»": { shirt: "#0097DB", number: "#FFFFFF" },
    "ФК «Краснодар»": { shirt: "#007A3D", number: "#000000" },
    "ФК «Кубань» Краснодар": { shirt: "#FFCC00", number: "#007A3D" },
    "ФК «Локомотив»": { shirt: "#C8102E", number: "#007A3D" },
    "ФК «Мордовия» Саранск": { shirt: "#C8102E", number: "#FFFFFF" },
    "ФК «Москва»": { shirt: "#800020", number: "#000000" },
    "ФК «Оренбург»": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Ростов»": { shirt: "#FFCC00", number: "#00539B" },
    "ФК «Рубин»": { shirt: "#7A2339", number: "#007A3D" },
    "ФК «Сатурн» Раменское": { shirt: "#000000", number: "#00539B" },
    "ФК «Сибирь»": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Спартак» Москва": { shirt: "#C8102E", number: "#FFFFFF" },
    "ФК «Томь» Томск": { shirt: "#007A3D", number: "#FFFFFF" },
    "ФК «Торпедо» Москва": { shirt: "#000000", number: "#FFFFFF" },
    "ФК «Урал» Екатеринбург": { shirt: "#FF6600", number: "#000000" },
    "ФК «Уфа»": { shirt: "#C8102E", number: "#007A3D" },
    "ФК «Химки»": { shirt: "#C8102E", number: "#000000" },
    "ЦСКА": { shirt: "#C8102E", number: "#002B5C" }
  };

  let state = createFreshState();

  function createFreshState() {
    return {
      round: 1,
      currentDraw: null,
      currentPlayers: [],
      selectedPlayerId: null,
      placed: {},
      usedPlayerIds: new Set()
    };
  }

  function startGame() {
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
    changeSideBtn.classList.remove("hidden");
    roundPill.classList.remove("hidden");
    resetDraft();
  }

  function resetDraft() {
    state = createFreshState();
    teamCodeEl.textContent = "---";
    seasonCodeEl.textContent = "----";
    spinHint.textContent = "Крути рулетку, чтобы получить клуб и сезон, затем выбери игрока.";
    drawCard.classList.remove("hidden");
    playersCard.classList.add("hidden");
    finishedCard.classList.add("hidden");
    clearHighlights();
    slots.forEach(slot => {
      slot.classList.remove("filled", "highlight");
      slot.disabled = false;
      slot.innerHTML = `<span>${slot.dataset.position}</span>`;
    });
    updateRound();
  }

  function updateRound() {
    roundPill.textContent = `Раунд ${Math.min(state.round, 11)} / 11`;
  }

  function getDrawGroups() {
    const groupsMap = new Map();
    DB.forEach(player => {
      const key = `${player.clubCode}|${player.clubName}|${player.season}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          clubCode: player.clubCode,
          clubName: player.clubName,
          season: player.season,
          key,
          players: []
        });
      }
      groupsMap.get(key).players.push(player);
    });
    return Array.from(groupsMap.values()).filter(group => {
      return group.players.some(player => !state.usedPlayerIds.has(player.id) && hasAnyFreePosition(player));
    });
  }

  function spin() {
    const groups = getDrawGroups();
    if (!groups.length) {
      spinHint.textContent = "В базе больше нет игроков, подходящих под свободные позиции.";
      spinBtn.disabled = true;
      return;
    }

    spinBtn.disabled = true;
    spinBtn.textContent = "КРУТИМ...";

    let ticks = 0;
    const maxTicks = 16;
    const timer = setInterval(() => {
      const temp = groups[Math.floor(Math.random() * groups.length)];
      teamCodeEl.textContent = temp.clubCode;
      seasonCodeEl.textContent = temp.season;
      ticks += 1;

      if (ticks >= maxTicks) {
        clearInterval(timer);
        const draw = groups[Math.floor(Math.random() * groups.length)];
        showPlayersForDraw(draw);
        spinBtn.disabled = false;
        spinBtn.textContent = "КРУТИТЬ";
      }
    }, 56);
  }

  function showPlayersForDraw(draw) {
    state.currentDraw = draw;
    state.currentPlayers = draw.players
      .filter(player => !state.usedPlayerIds.has(player.id) && hasAnyFreePosition(player))
      .sort((a, b) => b.stats.ovr - a.stats.ovr);
    state.selectedPlayerId = null;

    teamCodeEl.textContent = draw.clubCode;
    seasonCodeEl.textContent = draw.season;
    clubTitle.textContent = draw.clubName;
    clubSeason.textContent = draw.season;
    searchInput.value = "";
    draftInfo.textContent = `Выбери одного игрока — ${getOpenPositionsText()}`;
    drawCard.classList.add("hidden");
    playersCard.classList.remove("hidden");
    finishedCard.classList.add("hidden");
    clearHighlights();
    renderPlayers();
  }

  function renderPlayers() {
    const query = searchInput.value.trim().toLowerCase();
    const list = state.currentPlayers.filter(player => {
      const haystack = `${player.name} ${player.clubName} ${player.clubCode} ${player.positions.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!list.length) {
      playersList.innerHTML = `<div class="empty-state">Игроки не найдены.</div>`;
      return;
    }

    playersList.innerHTML = list.map(player => playerRowTemplate(player)).join("");

    playersList.querySelectorAll(".player-row").forEach(row => {
      row.addEventListener("click", () => selectPlayer(row.dataset.playerId));
    });
  }

  function playerRowTemplate(player) {
    const s = player.stats;
    const selected = player.id === state.selectedPlayerId ? " selected" : "";
    return `
      <button class="player-row${selected}" data-player-id="${escapeHtml(player.id)}">
        <span class="player-main">
          ${shirtTemplate(player)}
          <span class="player-text">
            <span class="player-name">${escapeHtml(player.name)}</span>
            <span class="player-meta">
              <span class="pos-badge">${escapeHtml(player.positions.join("/"))}</span>
              <span>Возраст: ${escapeHtml(player.age)}</span>
              <span>#${escapeHtml(player.number || "-")}</span>
            </span>
          </span>
        </span>
        <span class="num">${s.pac}</span>
        <span class="num">${s.sho}</span>
        <span class="num">${s.pas}</span>
        <span class="num">${s.dri}</span>
        <span class="num">${s.def}</span>
        <span class="num">${s.phy}</span>
        <span class="num ovr">${s.ovr}</span>
      </button>
    `;
  }

  function shirtTemplate(player) {
    const colors = getClubColors(player.clubName);
    const number = player.number || "–";
    return `
      <span
        class="shirt"
        style="--shirt-color: ${escapeAttribute(colors.shirt)}; --shirt-number-color: ${escapeAttribute(colors.number)};"
        title="${escapeAttribute(player.clubName)} — #${escapeAttribute(number)}"
        aria-label="Футболка ${escapeAttribute(player.clubName)}, номер ${escapeAttribute(number)}"
      ><span class="shirt-number">${escapeHtml(number)}</span></span>
    `;
  }

  function getClubColors(clubName) {
    return CLUB_COLORS[clubName] || DEFAULT_SHIRT_COLORS;
  }

  function selectPlayer(playerId) {
    const player = state.currentPlayers.find(item => item.id === playerId);
    if (!player) return;

    state.selectedPlayerId = playerId;
    draftInfo.textContent = `${player.name} выбран — нажми подсвеченную позицию →`;
    clearHighlights();

    slots.forEach(slot => {
      const position = slot.dataset.position;
      const isFilled = Boolean(state.placed[slot.dataset.slot]);
      if (!isFilled && player.positions.includes(position)) {
        slot.classList.add("highlight");
      }
    });

    renderPlayers();
  }

  function handleSlotClick(slot) {
    if (!state.selectedPlayerId || !slot.classList.contains("highlight")) return;
    const player = state.currentPlayers.find(item => item.id === state.selectedPlayerId);
    if (!player) return;

    const slotId = slot.dataset.slot;
    const position = slot.dataset.position;
    if (state.placed[slotId] || !player.positions.includes(position)) return;

    state.placed[slotId] = player;
    state.usedPlayerIds.add(player.id);
    renderFilledSlot(slot, player);
    clearHighlights();

    state.round += 1;
    updateRound();

    if (Object.keys(state.placed).length >= 11) {
      finishDraft();
    } else {
      showDrawAgain(player);
    }
  }

  function renderFilledSlot(slot, player) {
    slot.classList.add("filled");
    slot.disabled = true;
    slot.innerHTML = `
      <span class="placed-shirt-wrap">
        ${shirtTemplate(player)}
        <span class="rating-bubble">${player.stats.ovr}</span>
      </span>
      <span class="placed-name">${escapeHtml(player.name)}</span>
      <span class="placed-pos">${escapeHtml(slot.dataset.position)}</span>
    `;
  }

  function showDrawAgain(player) {
    playersCard.classList.add("hidden");
    drawCard.classList.remove("hidden");
    teamCodeEl.textContent = player.clubCode;
    seasonCodeEl.textContent = player.season;
    spinHint.textContent = `${Object.keys(state.placed).length}/11 позиций заполнено — крути для следующей.`;
    state.selectedPlayerId = null;
  }

  function finishDraft() {
    playersCard.classList.add("hidden");
    drawCard.classList.add("hidden");
    finishedCard.classList.remove("hidden");
    const rating = calculateTeamRating();
    teamRatingText.textContent = `Рейтинг команды: ${rating}`;
    roundPill.textContent = "Завершено";
  }

  function calculateTeamRating() {
    const players = Object.values(state.placed);
    if (!players.length) return 0;
    const sum = players.reduce((acc, player) => acc + player.stats.ovr, 0);
    return Math.round(sum / players.length);
  }

  function clearHighlights() {
    slots.forEach(slot => slot.classList.remove("highlight"));
  }

  function hasAnyFreePosition(player) {
    return slots.some(slot => !state.placed[slot.dataset.slot] && player.positions.includes(slot.dataset.position));
  }

  function getOpenPositionsText() {
    const open = slots
      .filter(slot => !state.placed[slot.dataset.slot])
      .map(slot => slot.dataset.position);

    const counts = open.reduce((acc, pos) => {
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(pos => counts[pos] > 1 ? `${pos}×${counts[pos]}` : pos).join(", ");
  }

  function getInitials(name) {
    return String(name)
      .split(/[\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  playBtn.addEventListener("click", startGame);
  spinBtn.addEventListener("click", spin);
  resetBtn.addEventListener("click", resetDraft);
  playAgainBtn.addEventListener("click", resetDraft);
  changeSideBtn.addEventListener("click", () => gameGrid.classList.toggle("flipped"));
  searchInput.addEventListener("input", renderPlayers);
  slots.forEach(slot => slot.addEventListener("click", () => handleSlotClick(slot)));

  if (!DB.length) {
    spinHint.textContent = "База игроков пустая. Добавь игроков в data/players.js.";
    spinBtn.disabled = true;
  }
})();
