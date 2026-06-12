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
  const REQUIRED_POSITIONS = ["GK", "RB", "CB", "CB", "LB", "CM", "CM", "CM", "RW", "ST", "LW"];

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
    spinHint.textContent = "Spin to draw a club & season, then draft a player.";
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
    roundPill.textContent = `Round ${Math.min(state.round, 11)} / 11`;
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
    spinBtn.textContent = "SPINNING...";

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
        spinBtn.textContent = "SPIN";
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
    draftInfo.textContent = `Pick one player — ${getOpenPositionsText()}`;
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
              <span>Age ${escapeHtml(player.age)}</span>
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
    const initials = escapeHtml(player.initials || getInitials(player.name));
    if (player.icon) {
      return `<span class="shirt"><img src="${escapeAttribute(player.icon)}" alt="${escapeAttribute(player.name)}" onerror="this.remove(); this.parentElement.textContent='${initials}'"></span>`;
    }
    return `<span class="shirt">${initials}</span>`;
  }

  function selectPlayer(playerId) {
    const player = state.currentPlayers.find(item => item.id === playerId);
    if (!player) return;

    state.selectedPlayerId = playerId;
    draftInfo.textContent = `${player.name} selected — click a highlighted position →`;
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
    spinHint.textContent = `${Object.keys(state.placed).length}/11 positions filled — spin for the next.`;
    state.selectedPlayerId = null;
  }

  function finishDraft() {
    playersCard.classList.add("hidden");
    drawCard.classList.add("hidden");
    finishedCard.classList.remove("hidden");
    const rating = calculateTeamRating();
    teamRatingText.textContent = `Team rating: ${rating}`;
    roundPill.textContent = "Completed";
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
