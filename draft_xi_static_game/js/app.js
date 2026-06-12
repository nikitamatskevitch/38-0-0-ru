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
  const shareResultBtn = document.getElementById("shareResultBtn");
  const shareStatus = document.getElementById("shareStatus");
  const teamRatingText = document.getElementById("teamRatingText");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
  const leaderboardBody = document.getElementById("leaderboardBody");
  const nicknameModal = document.getElementById("nicknameModal");
  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const nicknameError = document.getElementById("nicknameError");

  const DB = Array.isArray(window.PLAYERS_DB) ? window.PLAYERS_DB : [];
  const REQUIRED_POSITIONS = ["ВРТ", "ПЗ", "ЦЗ", "ЦЗ", "ЛЗ", "ЦП", "ЦП", "ЦП", "ПП", "ФРВ", "ЛП"];
  const NICKNAME_STORAGE_KEY = "rpl3800.nickname";
  const LEADERBOARD_STORAGE_KEY = "rpl3800.leaderboard";
  const SHARE_URL = "https://www.38-0-0.ru";
  // Для подключения MySQL оставь фронтенд без изменений и укажи здесь URL своего API.
  // API может читать/писать в MySQL и возвращать массив: [{ nickname, score, playedAt }].
  const LEADERBOARD_API_ENDPOINT = "";
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
    "ФК «Енисей»": { shirt: "#C8102E", number: "#FFFFFF" },
    "ФК «Кубань» Краснодар": { shirt: "#FFCC00", number: "#007A3D" },
    "ФК «Локомотив»": { shirt: "#C8102E", number: "#007A3D" },
    "ФК «Мордовия» Саранск": { shirt: "#C8102E", number: "#FFFFFF" },
    "ФК «Москва»": { shirt: "#800020", number: "#000000" },
    "ФК «Оренбург»": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Ростов»": { shirt: "#FFCC00", number: "#00539B" },
    "ФК «Ротор»": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Рубин»": { shirt: "#7A2339", number: "#007A3D" },
    "ФК «Сатурн» Раменское": { shirt: "#000000", number: "#00539B" },
    "ФК «Сибирь»": { shirt: "#00539B", number: "#FFFFFF" },
    "ФК «Спартак» Москва": { shirt: "#C8102E", number: "#FFFFFF" },
    "ФК «Тамбов»": { shirt: "#C8102E", number: "#FFFFFF" },
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
      usedPlayerIds: new Set(),
      lastRating: 0
    };
  }

  function startGame() {
    ensureNicknameBadge();
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
    if (shareStatus) shareStatus.textContent = "";
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
    if (shareStatus) shareStatus.textContent = "";
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
      >${escapeHtml(number)}</span>
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
    state.lastRating = rating;
    teamRatingText.textContent = `Рейтинг команды: ${rating}`;
    roundPill.textContent = "Завершено";
    saveLeaderboardResult(rating);
  }

  function calculateTeamRating() {
    const players = Object.values(state.placed);
    if (!players.length) return 0;
    const sum = players.reduce((acc, player) => acc + player.stats.ovr, 0);
    return Math.round(sum / players.length);
  }


  function getSavedNickname() {
    try {
      return window.localStorage.getItem(NICKNAME_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function saveNickname(nickname) {
    try {
      window.localStorage.setItem(NICKNAME_STORAGE_KEY, nickname);
    } catch (error) {
      // Если localStorage недоступен, игра всё равно запустится в текущей сессии.
    }
  }

  function normalizeNickname(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
  }

  function requestNicknameBeforeStart() {
    const savedNickname = getSavedNickname();
    if (savedNickname) {
      startGame();
      return;
    }

    nicknameError.textContent = "";
    nicknameInput.value = "";
    nicknameModal.classList.remove("hidden");
    setTimeout(() => nicknameInput.focus(), 0);
  }

  function ensureNicknameBadge() {
    const nickname = getSavedNickname();
    if (nickname) {
      roundPill.title = `Игрок: ${nickname}`;
    }
  }

  function getLocalLeaderboard() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(LEADERBOARD_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(isValidLeaderboardEntry) : [];
    } catch (error) {
      return [];
    }
  }

  function setLocalLeaderboard(entries) {
    try {
      window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      // Тихо пропускаем: результат уже показан игроку, даже если браузер запретил запись.
    }
  }

  function isValidLeaderboardEntry(entry) {
    return entry && typeof entry.nickname === "string" && Number.isFinite(Number(entry.score));
  }

  function sortLeaderboard(entries) {
    return entries
      .slice()
      .sort((a, b) => Number(b.score) - Number(a.score) || new Date(b.playedAt || 0) - new Date(a.playedAt || 0));
  }

  async function loadLeaderboard() {
    if (LEADERBOARD_API_ENDPOINT) {
      const response = await fetch(LEADERBOARD_API_ENDPOINT);
      if (!response.ok) throw new Error("Не удалось загрузить leaderboard");
      const entries = await response.json();
      return sortLeaderboard(Array.isArray(entries) ? entries.filter(isValidLeaderboardEntry) : []);
    }

    return sortLeaderboard(getLocalLeaderboard());
  }

  async function saveLeaderboardResult(score) {
    const entry = {
      nickname: getSavedNickname() || "Игрок",
      score,
      playedAt: new Date().toISOString()
    };

    if (LEADERBOARD_API_ENDPOINT) {
      try {
        await fetch(LEADERBOARD_API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry)
        });
        return;
      } catch (error) {
        // При ошибке API сохраняем локально, чтобы игрок не потерял результат.
      }
    }

    const entries = sortLeaderboard([...getLocalLeaderboard(), entry]).slice(0, 100);
    setLocalLeaderboard(entries);
  }

  async function openLeaderboard() {
    leaderboardModal.classList.remove("hidden");
    leaderboardBody.innerHTML = `<tr><td class="leaderboard-empty" colspan="4">Загружаем результаты...</td></tr>`;

    try {
      renderLeaderboard(await loadLeaderboard());
    } catch (error) {
      leaderboardBody.innerHTML = `<tr><td class="leaderboard-empty" colspan="4">Не удалось загрузить таблицу лидеров.</td></tr>`;
    }
  }

  function closeLeaderboard() {
    leaderboardModal.classList.add("hidden");
  }

  function renderLeaderboard(entries) {
    if (!entries.length) {
      leaderboardBody.innerHTML = `<tr><td class="leaderboard-empty" colspan="4">Пока нет результатов. Собери XI первым!</td></tr>`;
      return;
    }

    leaderboardBody.innerHTML = entries.slice(0, 50).map((entry, index) => {
      const rank = index === 0 ? "🏆 1" : String(index + 1);
      return `
        <tr>
          <td class="leaderboard-rank">${rank}</td>
          <td>${escapeHtml(entry.nickname)}</td>
          <td>${escapeHtml(entry.score)}</td>
          <td>${escapeHtml(formatPlayedAt(entry.playedAt))}</td>
        </tr>
      `;
    }).join("");
  }

  function formatPlayedAt(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  async function shareResult() {
    const score = state.lastRating || calculateTeamRating();
    const text = `попробуй побить мой рекорд в игре 38-0-0 Легенды РПЛ. Я набрал: ${score}`;
    const shareData = {
      title: "38-0-0 Легенды РПЛ",
      text,
      url: SHARE_URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shareStatus.textContent = "Готово — результат отправлен!";
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    const fallbackText = `${text} ${SHARE_URL}`;
    try {
      await navigator.clipboard.writeText(fallbackText);
      shareStatus.textContent = "Сообщение скопировано — вставь его в мессенджер!";
    } catch (error) {
      shareStatus.textContent = fallbackText;
    }
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

  playBtn.addEventListener("click", requestNicknameBeforeStart);
  spinBtn.addEventListener("click", spin);
  resetBtn.addEventListener("click", resetDraft);
  playAgainBtn.addEventListener("click", resetDraft);
  shareResultBtn.addEventListener("click", shareResult);
  leaderboardBtn.addEventListener("click", openLeaderboard);
  closeLeaderboardBtn.addEventListener("click", closeLeaderboard);
  leaderboardModal.addEventListener("click", event => {
    if (event.target === leaderboardModal) closeLeaderboard();
  });
  nicknameForm.addEventListener("submit", event => {
    event.preventDefault();
    const nickname = normalizeNickname(nicknameInput.value);
    if (nickname.length < 2) {
      nicknameError.textContent = "Минимум 2 символа.";
      return;
    }
    saveNickname(nickname);
    nicknameModal.classList.add("hidden");
    startGame();
  });
  changeSideBtn.addEventListener("click", () => gameGrid.classList.toggle("flipped"));
  searchInput.addEventListener("input", renderPlayers);
  slots.forEach(slot => slot.addEventListener("click", () => handleSlotClick(slot)));

  if (!DB.length) {
    spinHint.textContent = "База игроков пустая. Добавь игроков в data/players.js.";
    spinBtn.disabled = true;
  }
})();
