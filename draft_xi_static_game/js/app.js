(function () {
  "use strict";

  const pageMode = document.body.dataset.page || "home";
  const slots = Array.from(document.querySelectorAll(".slot"));
  const startScreen = document.getElementById("startScreen");
  const gameScreen = document.getElementById("gameScreen");
  const playBtn = document.getElementById("playBtn");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const changeSideBtn = document.getElementById("changeSideBtn");
  const roundPill = document.getElementById("roundPill");
  const gameGrid = document.getElementById("gameGrid");
  const formationCards = Array.from(document.querySelectorAll(".formation-card"));
  const formationTitle = document.getElementById("formationTitle");
  const formationPill = document.getElementById("formationPill");

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
  const finishHeadline = document.getElementById("finishHeadline");
  const projectedWins = document.getElementById("projectedWins");
  const projectedDraws = document.getElementById("projectedDraws");
  const projectedLosses = document.getElementById("projectedLosses");
  const projectedPointsText = document.getElementById("projectedPointsText");
  const seasonBadge = document.getElementById("seasonBadge");
  const matchResultsList = document.getElementById("matchResultsList");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
  const leaderboardBody = document.getElementById("leaderboardBody");
  const perfectPlayersList = document.getElementById("perfectPlayersList");
  const recentAttemptsList = document.getElementById("recentAttemptsList");
  const nicknameModal = document.getElementById("nicknameModal");
  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const nicknameError = document.getElementById("nicknameError");

  const DB = Array.isArray(window.PLAYERS_DB) ? window.PLAYERS_DB : [];
  const SLOT_IDS = ["st", "lw", "rw", "cm-left", "cm-mid", "cm-right", "lb", "cb-left", "cb-right", "rb", "gk"];
  const FORMATIONS = {
    "4-3-3": [
      slot("st", "ФРВ", 50, 13), slot("lw", "ЛП", 18, 20), slot("rw", "ПП", 82, 20),
      slot("cm-left", "ЦП", 26, 51), slot("cm-mid", "ЦП", 50, 45), slot("cm-right", "ЦП", 74, 51),
      slot("lb", "ЛЗ", 16, 69), slot("cb-left", "ЦЗ", 40, 72), slot("cb-right", "ЦЗ", 60, 72), slot("rb", "ПЗ", 84, 69),
      slot("gk", "ВРТ", 50, 88)
    ],
    "4-4-2": [
      slot("st", "ФРВ", 40, 15), slot("lw", "ФРВ", 60, 15),
      slot("rw", "ЛП", 16, 43), slot("cm-left", "ЦП", 39, 46), slot("cm-mid", "ЦП", 61, 46), slot("cm-right", "ПП", 84, 43),
      slot("lb", "ЛЗ", 16, 69), slot("cb-left", "ЦЗ", 40, 72), slot("cb-right", "ЦЗ", 60, 72), slot("rb", "ПЗ", 84, 69),
      slot("gk", "ВРТ", 50, 88)
    ],
    "4-2-4": [
      slot("st", "ЛП", 15, 20), slot("lw", "ФРВ", 38, 14), slot("rw", "ФРВ", 62, 14), slot("cm-left", "ПП", 85, 20),
      slot("cm-mid", "ЦП", 40, 48), slot("cm-right", "ЦП", 60, 48),
      slot("lb", "ЛЗ", 16, 69), slot("cb-left", "ЦЗ", 40, 72), slot("cb-right", "ЦЗ", 60, 72), slot("rb", "ПЗ", 84, 69),
      slot("gk", "ВРТ", 50, 88)
    ],
    "3-4-3": [
      slot("st", "ФРВ", 50, 13), slot("lw", "ЛП", 18, 20), slot("rw", "ПП", 82, 20),
      slot("cm-left", "ЛП", 16, 46), slot("cm-mid", "ЦП", 39, 49), slot("cm-right", "ЦП", 61, 49), slot("lb", "ПП", 84, 46),
      slot("cb-left", "ЦЗ", 30, 72), slot("cb-right", "ЦЗ", 50, 75), slot("rb", "ЦЗ", 70, 72),
      slot("gk", "ВРТ", 50, 88)
    ],
    "3-5-2": [
      slot("st", "ФРВ", 40, 15), slot("lw", "ФРВ", 60, 15),
      slot("rw", "ЛП", 12, 47), slot("cm-left", "ЦП", 31, 51), slot("cm-mid", "ЦП", 50, 44), slot("cm-right", "ЦП", 69, 51), slot("lb", "ПП", 88, 47),
      slot("cb-left", "ЦЗ", 30, 72), slot("cb-right", "ЦЗ", 50, 75), slot("rb", "ЦЗ", 70, 72),
      slot("gk", "ВРТ", 50, 88)
    ],
    "5-3-2": [
      slot("st", "ФРВ", 40, 15), slot("lw", "ФРВ", 60, 15),
      slot("rw", "ЦП", 30, 47), slot("cm-left", "ЦП", 50, 43), slot("cm-mid", "ЦП", 70, 47),
      slot("cm-right", "ЛЗ", 10, 70), slot("lb", "ЦЗ", 30, 73), slot("cb-left", "ЦЗ", 50, 76), slot("cb-right", "ЦЗ", 70, 73), slot("rb", "ПЗ", 90, 70),
      slot("gk", "ВРТ", 50, 88)
    ],
    "5-4-1": [
      slot("st", "ФРВ", 50, 14),
      slot("lw", "ЛП", 16, 43), slot("rw", "ЦП", 39, 47), slot("cm-left", "ЦП", 61, 47), slot("cm-mid", "ПП", 84, 43),
      slot("cm-right", "ЛЗ", 10, 70), slot("lb", "ЦЗ", 30, 73), slot("cb-left", "ЦЗ", 50, 76), slot("cb-right", "ЦЗ", 70, 73), slot("rb", "ПЗ", 90, 70),
      slot("gk", "ВРТ", 50, 88)
    ]
  };
  const NICKNAME_STORAGE_KEY = "rpl3800.nickname";
  const LEADERBOARD_STORAGE_KEY = "rpl3800.leaderboard";
  const SHARE_URL = "https://www.38-0-0.ru";
  // Для подключения MySQL оставь фронтенд без изменений и укажи здесь URL своего API.
  // API может читать/писать в MySQL и возвращать массив: [{ nickname, score, playedAt }].
  const LEADERBOARD_API_ENDPOINT = "/api/leaderboard.php";
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

  const slotById = new Map(slots.map(item => [item.dataset.slot, item]));
  let selectedFormation = getInitialFormation();
  let state = createFreshState();

  function getInitialFormation() {
    const params = new URLSearchParams(window.location.search);
    const formation = params.get("formation");
    return FORMATIONS[formation] ? formation : "4-3-3";
  }

  function createFreshState() {
    return {
      round: 1,
      currentDraw: null,
      currentPlayers: [],
      selectedPlayerId: null,
      placed: {},
      usedPlayerIds: new Set(),
      lastRating: 0,
      lastSeason: null,
      matchResults: [],
      formation: selectedFormation
    };
  }

  function slot(id, position, left, top) {
    return { id, position, left, top };
  }

  function startGame() {
    ensureNicknameBadge();
    if (startScreen) startScreen.classList.add("hidden");
    if (gameScreen) gameScreen.classList.remove("hidden");
    if (resetBtn) resetBtn.classList.remove("hidden");
    if (changeSideBtn) changeSideBtn.classList.remove("hidden");
    if (roundPill) roundPill.classList.remove("hidden");
    resetDraft();
  }

  function selectFormation(formationId) {
    if (!FORMATIONS[formationId]) return;

    selectedFormation = formationId;
    updateFormationChoice();
    applyFormationToPitch();
  }

  function updateFormationChoice() {
    formationCards.forEach(card => {
      const isActive = card.dataset.formation === selectedFormation;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-pressed", String(isActive));
    });

    if (formationTitle) formationTitle.textContent = `Схема ${selectedFormation}`;
    if (formationPill) formationPill.textContent = selectedFormation.replaceAll("-", " - ");
    updatePlayLink();
  }

  function updatePlayLink() {
    if (!playBtn || playBtn.tagName !== "A") return;

    const url = new URL("/game/", window.location.origin);
    url.searchParams.set("formation", selectedFormation);
    playBtn.href = `${url.pathname}${url.search}`;
  }

  function applyFormationToPitch() {
    const formationSlots = FORMATIONS[selectedFormation] || FORMATIONS["4-3-3"];
    const activeIds = new Set(formationSlots.map(item => item.id));

    SLOT_IDS.forEach(id => {
      const slotEl = slotById.get(id);
      if (slotEl) slotEl.classList.toggle("hidden", !activeIds.has(id));
    });

    formationSlots.forEach(item => {
      const slotEl = slotById.get(item.id);
      if (!slotEl) return;

      slotEl.dataset.position = item.position;
      slotEl.style.left = `${item.left}%`;
      slotEl.style.top = `${item.top}%`;
    });
  }

  function resetDraft() {
    state = createFreshState();
    applyFormationToPitch();
    teamCodeEl.textContent = "---";
    seasonCodeEl.textContent = "----";
    spinHint.textContent = "Крути рулетку, чтобы получить клуб и сезон, затем выбери игрока.";
    drawCard.classList.remove("hidden");
    playersCard.classList.add("hidden");
    finishedCard.classList.add("hidden");
    if (shareStatus) shareStatus.textContent = "";
    if (matchResultsList) matchResultsList.innerHTML = "";
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
    if (matchResultsList) matchResultsList.innerHTML = "";
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
    const season = getProjectedSeason(rating);
    state.lastRating = rating;
    state.lastSeason = season;
    state.matchResults = generateMatchResults(season);
    renderFinishSummary(rating, season);
    roundPill.textContent = "Завершено";
    saveLeaderboardResult(rating);
  }


  function renderFinishSummary(rating, season = getProjectedSeason(rating)) {

    if (finishHeadline) finishHeadline.textContent = `Сможет ли твой XI сделать 38-0-0?`;
    teamRatingText.textContent = `Рейтинг команды: ${rating}`;
    if (projectedWins) projectedWins.textContent = season.wins;
    if (projectedDraws) projectedDraws.textContent = season.draws;
    if (projectedLosses) projectedLosses.textContent = season.losses;
    if (projectedPointsText) projectedPointsText.textContent = `38 матчей против случайных команд из базы · ${season.points} очков · голы ${season.goalsFor}:${season.goalsAgainst}`;
    if (seasonBadge) {
      seasonBadge.textContent = season.label;
      seasonBadge.dataset.tier = season.tier;
    }
    renderMatchResults(state.matchResults);
  }

  function getProjectedSeason(rating) {
    const safeRating = Math.max(0, Math.min(100, Number(rating) || 0));
    const opponents = pickSeasonOpponents(38);
    const matches = opponents.map(opponent => simulateMatch(safeRating, opponent.rating));
    const wins = matches.filter(match => match.result === "win").length;
    const draws = matches.filter(match => match.result === "draw").length;
    const losses = matches.filter(match => match.result === "loss").length;
    const points = (wins * 3) + draws;
    const goalsFor = matches.reduce((acc, match) => acc + match.goalsFor, 0);
    const goalsAgainst = matches.reduce((acc, match) => acc + match.goalsAgainst, 0);
    const tier = wins === 38 ? "perfect" : points >= 88 ? "title" : points >= 65 ? "europe" : points >= 45 ? "mid" : "survival";
    const labels = {
      perfect: "38-0-0 сезон",
      title: "Гонка за титул",
      europe: "Еврокубковый темп",
      mid: "Середина таблицы",
      survival: "Борьба за выживание"
    };

    return { wins, draws, losses, points, goalsFor, goalsAgainst, label: labels[tier], tier };
  }

  function pickSeasonOpponents(count) {
    const teams = getHistoricalTeamRatings();
    if (!teams.length) return Array.from({ length: count }, () => ({ rating: 0 }));

    const pool = shuffleArray(teams);
    const opponents = [];
    while (opponents.length < count) {
      opponents.push(pool[opponents.length % pool.length]);
      if (opponents.length % pool.length === 0) shuffleArray(pool);
    }
    return opponents;
  }

  function getHistoricalTeamRatings() {
    const groupsMap = new Map();

    DB.forEach(player => {
      const rating = Number(player.stats && player.stats.ovr);
      if (!Number.isFinite(rating)) return;

      const key = `${player.clubCode}|${player.clubName}|${player.season}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          clubCode: player.clubCode,
          clubName: player.clubName,
          season: player.season,
          total: 0,
          count: 0
        });
      }

      const group = groupsMap.get(key);
      group.total += rating;
      group.count += 1;
    });

    return Array.from(groupsMap.values())
      .filter(group => group.count > 0)
      .map(group => ({
        clubCode: group.clubCode,
        clubName: group.clubName,
        season: group.season,
        rating: Math.round(group.total / group.count)
      }));
  }

  function simulateMatch(teamRating, opponentRating) {
    const diff = teamRating - opponentRating;
    let result;

    if (diff >= 4) {
      result = "win";
    } else if (Math.abs(diff) <= 3) {
      result = randomItem(["win", "draw", "loss"]);
    } else {
      result = randomItem(["draw", "loss"]);
    }

    return { result, ...inventScore(result, diff) };
  }

  function inventScore(result, diff) {
    const diffBonus = Math.min(3, Math.floor(Math.abs(diff) / 10));

    if (result === "win") {
      const goalsAgainst = randomInt(0, 2);
      const margin = randomInt(1, Math.max(1, 2 + diffBonus));
      return { goalsFor: goalsAgainst + margin, goalsAgainst };
    }

    if (result === "draw") {
      const goals = randomInt(0, 3);
      return { goalsFor: goals, goalsAgainst: goals };
    }

    const goalsFor = randomInt(0, 2);
    const margin = randomInt(1, Math.max(1, 2 + diffBonus));
    return { goalsFor, goalsAgainst: goalsFor + margin };
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
  }

  function generateMatchResults(season) {
    const opponents = getOpponentPool();
    const outcomes = shuffleDeterministic([
      ...Array(season.wins).fill("win"),
      ...Array(season.draws).fill("draw"),
      ...Array(season.losses).fill("loss")
    ], getSeasonSeed(season));

    return outcomes.map((outcome, index) => {
      const opponent = opponents[index % opponents.length] || { clubName: "Случайная команда", season: "—" };
      return {
        round: index + 1,
        outcome,
        opponent: opponent.clubName,
        season: opponent.season,
        score: getMatchScore(outcome, index, season)
      };
    });
  }

  function getOpponentPool() {
    const seen = new Set();
    const selectedClubSeasons = new Set(Object.values(state.placed).map(player => `${player.clubName}|${player.season}`));

    return DB.reduce((items, player) => {
      const key = `${player.clubName}|${player.season}`;
      if (seen.has(key) || selectedClubSeasons.has(key)) return items;
      seen.add(key);
      items.push({ clubName: player.clubName, season: player.season });
      return items;
    }, []);
  }

  function getMatchScore(outcome, index, season) {
    const variants = {
      win: [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1]],
      draw: [[0, 0], [1, 1], [2, 2]],
      loss: [[0, 1], [1, 2], [0, 2], [2, 3]]
    };
    const list = variants[outcome] || variants.draw;
    const [forGoals, againstGoals] = list[(index + season.points) % list.length];
    return `${forGoals}:${againstGoals}`;
  }

  function getSeasonSeed(season) {
    return `${state.formation}|${season.wins}-${season.draws}-${season.losses}|${Object.values(state.placed).map(player => player.id).sort().join(",")}`;
  }

  function shuffleDeterministic(items, seedText) {
    const shuffled = items.slice();
    let seed = hashText(seedText);

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const swapIndex = seed % (index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }

  function hashText(value) {
    return String(value).split("").reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
    }, 2166136261);
  }

  function renderMatchResults(results) {
    if (!matchResultsList) return;

    if (!results.length) {
      matchResultsList.innerHTML = `<div class="match-results-empty">Матчи появятся после завершения драфта.</div>`;
      return;
    }

    matchResultsList.innerHTML = results.map(match => `
      <div class="match-result-row ${match.outcome}">
        <div class="match-result-meta">
          <span>${match.round}. матч</span>
          <strong>${escapeHtml(match.opponent)}, сезон ${escapeHtml(match.season)}</strong>
        </div>
        <div class="match-result-score">${escapeHtml(match.score)}</div>
      </div>
    `).join("");
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

  function sortByNewest(entries) {
    return entries
      .slice()
      .sort((a, b) => new Date(b.playedAt || 0) - new Date(a.playedAt || 0));
  }

  function getLeaderboardUrl(view = "top", limit) {
    const url = new URL(LEADERBOARD_API_ENDPOINT, window.location.href);
    url.searchParams.set("view", view);
    if (limit) url.searchParams.set("limit", String(limit));
    return url.toString();
  }

  async function loadLeaderboard(view = "top", limit) {
    if (LEADERBOARD_API_ENDPOINT) {
      const response = await fetch(getLeaderboardUrl(view, limit));
      if (!response.ok) throw new Error("Не удалось загрузить leaderboard");
      const entries = await response.json();
      return normalizeLeaderboardEntries(entries, view, limit);
    }

    return normalizeLeaderboardEntries(getLocalLeaderboard(), view, limit);
  }

  function normalizeLeaderboardEntries(entries, view = "top", limit) {
    const validEntries = Array.isArray(entries) ? entries.filter(isValidLeaderboardEntry) : [];
    const sortedEntries = view === "recent" || view === "perfect"
      ? sortByNewest(validEntries)
      : sortLeaderboard(validEntries);
    const filteredEntries = view === "perfect"
      ? sortedEntries.filter(entry => {
        const season = getEntrySeason(entry, entry.score);
        return season.wins === 38 && season.draws === 0 && season.losses === 0;
      })
      : sortedEntries;

    return filteredEntries.slice(0, limit || 50);
  }

  async function saveLeaderboardResult(score) {
    const entry = {
      nickname: getSavedNickname() || "Игрок",
      score,
      wins: state.lastSeason?.wins,
      draws: state.lastSeason?.draws,
      losses: state.lastSeason?.losses,
      points: state.lastSeason?.points,
      formation: state.formation || selectedFormation,
      playedAt: new Date().toISOString()
    };

    if (LEADERBOARD_API_ENDPOINT) {
      try {
        const response = await fetch(LEADERBOARD_API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry)
        });
        if (!response.ok) throw new Error("Не удалось сохранить leaderboard");
        refreshHomeFeeds();
        return;
      } catch (error) {
        // При ошибке API сохраняем локально, чтобы игрок не потерял результат.
      }
    }

    const entries = sortLeaderboard([...getLocalLeaderboard(), entry]).slice(0, 100);
    setLocalLeaderboard(entries);
    refreshHomeFeeds();
  }

  async function refreshHomeFeeds() {
    await Promise.all([
      refreshHomeFeed(perfectPlayersList, "perfect", "Пока никто не сделал 38-0-0.", "Не удалось загрузить игроков."),
      refreshHomeFeed(recentAttemptsList, "recent", "Пока нет попыток.", "Не удалось загрузить попытки.")
    ]);
  }

  async function refreshHomeFeed(container, view, emptyText, errorText) {
    if (!container) return;

    try {
      renderHomeFeed(container, await loadLeaderboard(view, 10), { emptyText });
    } catch (error) {
      container.innerHTML = `<div class="home-feed-empty">${escapeHtml(errorText)}</div>`;
    }
  }

  function renderHomeFeed(container, entries, options = {}) {
    if (!entries.length) {
      container.innerHTML = `<div class="home-feed-empty">${escapeHtml(options.emptyText || "Пока нет результатов.")}</div>`;
      return;
    }

    container.innerHTML = entries.slice(0, 10).map(entry => `
      <div class="home-feed-row">
        <div class="home-feed-player">
          <strong>${escapeHtml(entry.nickname)}</strong>
          <span>${escapeHtml(formatPlayedAtShort(entry.playedAt))}</span>
        </div>
        <div class="home-feed-result">
          <strong>${formatHomeRecord(entry.score, entry)}</strong>
          <span>${formatHomeScoreDetails(entry.score, entry.formation, entry)}</span>
        </div>
      </div>
    `).join("");
  }

  function getEntrySeason(entry, fallbackScore) {
    const wins = Number(entry?.wins);
    const draws = Number(entry?.draws);
    const losses = Number(entry?.losses);
    if ([wins, draws, losses].every(Number.isFinite) && (wins + draws + losses) === 38) {
      return { wins, draws, losses, points: (wins * 3) + draws };
    }

    return getProjectedSeason(fallbackScore);
  }

  function formatHomeRecord(score, entry = {}) {
    const season = getEntrySeason(entry, score);
    return `<span class="home-record-win">${season.wins}</span><span class="home-record-separator">-</span><span class="home-record-draw">${season.draws}</span><span class="home-record-separator">-</span><span class="home-record-loss">${season.losses}</span>`;
  }

  function formatHomeScoreDetails(score, formation, entry = {}) {
    const season = getEntrySeason(entry, score);
    return `${season.points} очков · схема: ${escapeHtml(formation || "—")}`;
  }

  function formatHomeScore(score) {
    return Number(score) >= 100 ? "38-0-0" : `${escapeHtml(score)} очков`;
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

  function formatPlayedAtShort(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function getSharePayload() {
    const score = state.lastRating || calculateTeamRating();
    const nickname = getSavedNickname() || "Игрок";
    const text = `попробуй побить мой рекорд в игре 38-0-0 Легенды РПЛ. Я набрал: ${score}`;
    const sharePageUrl = getSharePageUrl(nickname, score);

    return {
      title: "38-0-0 Легенды РПЛ",
      text,
      url: sharePageUrl,
      nickname,
      score
    };
  }

  function getSharePageUrl(nickname, score) {
    const url = new URL("share.html", SHARE_URL);
    url.searchParams.set("nickname", nickname);
    url.searchParams.set("score", score);
    return url.toString();
  }

  function shareResult() {
    const payload = getSharePayload();
    const shareWindow = window.open(payload.url, "_blank");

    if (shareWindow) {
      shareWindow.opener = null;
      return;
    }

    window.location.href = payload.url;
  }

  function clearHighlights() {
    slots.forEach(slot => slot.classList.remove("highlight"));
  }

  function hasAnyFreePosition(player) {
    return slots.some(slot => !slot.classList.contains("hidden") && !state.placed[slot.dataset.slot] && player.positions.includes(slot.dataset.position));
  }

  function getOpenPositionsText() {
    const open = slots
      .filter(slot => !slot.classList.contains("hidden") && !state.placed[slot.dataset.slot])
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

  formationCards.forEach(card => card.addEventListener("click", () => selectFormation(card.dataset.formation)));
  updateFormationChoice();
  applyFormationToPitch();

  if (playBtn && pageMode === "game" && playBtn.tagName !== "A") {
    playBtn.addEventListener("click", requestNicknameBeforeStart);
  }
  if (spinBtn) spinBtn.addEventListener("click", spin);
  if (resetBtn) resetBtn.addEventListener("click", resetDraft);
  if (playAgainBtn) playAgainBtn.addEventListener("click", resetDraft);
  if (shareResultBtn) shareResultBtn.addEventListener("click", shareResult);
  if (leaderboardBtn) leaderboardBtn.addEventListener("click", openLeaderboard);
  if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener("click", closeLeaderboard);
  if (leaderboardModal) {
    leaderboardModal.addEventListener("click", event => {
      if (event.target === leaderboardModal) closeLeaderboard();
    });
  }
  if (nicknameForm) {
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
  }
  if (changeSideBtn && gameGrid) changeSideBtn.addEventListener("click", () => gameGrid.classList.toggle("flipped"));
  if (searchInput) searchInput.addEventListener("input", renderPlayers);
  slots.forEach(slot => slot.addEventListener("click", () => handleSlotClick(slot)));
  refreshHomeFeeds();
  if (perfectPlayersList || recentAttemptsList) {
    window.setInterval(refreshHomeFeeds, 30000);
  }

  if (pageMode === "game") {
    requestNicknameBeforeStart();
  }

  if (!DB.length && spinHint && spinBtn) {
    spinHint.textContent = "База игроков пустая. Добавь игроков в data/players.js.";
    spinBtn.disabled = true;
  }
})();
