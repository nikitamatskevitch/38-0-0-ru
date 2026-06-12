(function () {
  "use strict";

  const SITE_URL = "https://www.38-0-0.ru";
  const params = new URLSearchParams(window.location.search);
  const nicknameEl = document.getElementById("shareNickname");
  const scoreEl = document.getElementById("shareScore");
  const challengeTextEl = document.getElementById("shareChallengeText");
  const copyFriendLinkBtn = document.getElementById("copyFriendLinkBtn");
  const shareFriendBtn = document.getElementById("shareFriendBtn");
  const statusEl = document.getElementById("sharePageStatus");
  const confettiLayer = document.getElementById("confettiLayer");

  const nickname = normalizeNickname(params.get("nickname")) || "Игрок";
  const score = normalizeScore(params.get("score"));
  const challengeText = `Я набрал ${score} попробуй побить мой рекорд в игре 38-0-0 Легенды РПЛ.`;
  const friendLink = getCanonicalFriendLink(nickname, score);
  const shareMessage = getShareMessage(score, friendLink);

  nicknameEl.textContent = nickname;
  scoreEl.textContent = score;
  challengeTextEl.textContent = challengeText;
  renderConfetti();

  function normalizeNickname(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
  }

  function normalizeScore(value) {
    const scoreNumber = Number.parseInt(value, 10);
    if (!Number.isFinite(scoreNumber) || scoreNumber < 0) return 0;
    return scoreNumber;
  }

  function getCanonicalFriendLink(playerNickname, playerScore) {
    const url = new URL("share.html", SITE_URL);
    url.searchParams.set("nickname", playerNickname);
    url.searchParams.set("score", playerScore);
    return url.toString();
  }


  function getShareMessage(playerScore, link) {
    return `Попробуй побить мой рекорд!\nЯ набрал ${playerScore} попробуй побить мой рекорд в игре 38-0-0 Легенды РПЛ.\n\n${link}`;
  }

  function getShareData() {
    return {
      title: "38-0-0 Легенды РПЛ",
      text: `Попробуй побить мой рекорд!\n${challengeText}`,
      url: friendLink
    };
  }

  async function copyText(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  async function copyFriendLink() {
    try {
      await copyText(shareMessage);
      statusEl.textContent = "Ссылка для друга скопирована!";
      copyFriendLinkBtn.textContent = "Ссылка скопирована";
      setTimeout(() => {
        copyFriendLinkBtn.textContent = "Скопировать ссылку для друга";
      }, 1500);
    } catch (error) {
      statusEl.textContent = shareMessage;
    }
  }

  async function shareToMessenger() {
    const shareData = getShareData();

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        statusEl.textContent = "Готово — результат отправлен!";
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      await copyText(shareMessage);
      statusEl.textContent = "Браузер не открыл окно шаринга — сообщение скопировано.";
    } catch (error) {
      statusEl.textContent = shareMessage;
    }
  }

  function renderConfetti() {
    const colors = ["#ff2f86", "#ffde44", "#36f386", "#8738ff", "#ffffff", "#ff5a4a"];
    const pieces = 90;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < pieces; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--x", `${Math.random() * 100}%`);
      piece.style.setProperty("--delay", `${Math.random() * 2.2}s`);
      piece.style.setProperty("--duration", `${2.8 + Math.random() * 2.7}s`);
      piece.style.setProperty("--rotate", `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty("--color", colors[index % colors.length]);
      fragment.appendChild(piece);
    }

    confettiLayer.appendChild(fragment);
  }

  copyFriendLinkBtn.addEventListener("click", copyFriendLink);
  shareFriendBtn.addEventListener("click", shareToMessenger);
})();
