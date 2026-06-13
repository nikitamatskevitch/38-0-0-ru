Draft XI — статическая HTML/CSS/JS игра без Node.js

Как запустить:
1. Распакуй архив.
2. Открой файл index.html двойным кликом в браузере.
3. Никакой сервер, npm, Node.js и сборка не нужны.

Как редактировать базу футболистов:
1. Открой файл data/players.js.
2. В массив window.PLAYERS_DB добавь нового игрока по примеру существующих.
3. Основные поля:
   - id: уникальный id игрока, например "ars2017-saka"
   - clubCode: короткий код клуба, например "ARS"
   - clubName: название клуба
   - season: сезон/год
   - name: имя игрока
   - positions: позиции из таблицы 38-0-0, например ["ПП", "ЛП"]
   - age: возраст
   - number: номер
   - initials: буквы на футболке
   - stats: pac=Темп, sho=Удары, pas=Пасы, dri=Дриблинг, def=Защита, phy=Физика, ovr=Общий рейтинг
   - icon: необязательный путь к изображению игрока или футболке, например "assets/saka.png"

Поддерживаемые позиции для поля 4-3-3:
ВРТ, ПЗ, ЦЗ, ЛЗ, ЦП, ПП, ФРВ, ЛП

Логика игры:
- «Играть» открывает игру.
- «Крутить» выбирает случайный клуб и сезон из базы, сгенерированной из 38-0-0.xlsx.
- После выбора игрока подсвечиваются подходящие свободные позиции.
- После клика по позиции игрок ставится на поле.
- После заполнения 11 позиций считается средний рейтинг команды.

Где менять дизайн:
- styles.css — цвета, размеры, поле, карточки, кнопки.
- index.html — структура экрана.
- js/app.js — логика игры.

Как подключить общий leaderboard через MySQL:
1. Создай таблицу в MySQL:
   CREATE TABLE leaderboard (
     id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
     nickname VARCHAR(24) NOT NULL,
     score INT NOT NULL,
     formation VARCHAR(5) NOT NULL DEFAULT '',
     played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_score_played_at (score DESC, played_at DESC),
     INDEX idx_played_at (played_at DESC)
   ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
2. Залей файл api/leaderboard.php на хостинг вместе с сайтом.
3. В api/leaderboard.php укажи свои DB_HOST, DB_NAME, DB_USER и DB_PASS от MySQL.
4. В js/app.js endpoint должен смотреть на этот файл:
   const LEADERBOARD_API_ENDPOINT = "https://www.38-0-0.ru/api/leaderboard.php";
5. API отвечает на GET массивом [{ nickname, score, formation, playedAt }] и на POST принимает JSON { nickname, score, formation, playedAt }.
6. Для блоков на главной используются GET-параметры view=perfect&limit=10 и view=recent&limit=10.
7. Если API временно недоступен, игра сохранит результат локально в браузере как резервный вариант.
8. Если таблица уже создана без схемы, добавь колонку: ALTER TABLE leaderboard ADD COLUMN formation VARCHAR(5) NOT NULL DEFAULT '' AFTER score;

Как работает «Поделиться результатом»:
- index.html открывает share.html с параметрами nickname и score.
- share.html показывает результат из URL.
- Кнопка «Скопировать ссылку для друга» копирует текст:
  Попробуй побить мой рекорд!
  Я набрал {очки} попробуй побить мой рекорд в игре 38-0-0 Легенды РПЛ.

  https://www.38-0-0.ru/share.html?nickname=...&score=...

Как обновлять файлы без Ctrl+F5:
1. HTML-страницы подключают изменяемые CSS/JS/data/logo/favicon-файлы с параметром версии ?v=1.
2. После каждого обновления сайта меняй версию во всех подключениях изменяемых файлов: например ?v=1 -> ?v=2 или ?v=20260613.
3. Загружай на хостинг обновлённые HTML-файлы вместе с изменёнными CSS/JS/data/image-файлами — браузер увидит новый URL и скачает свежие файлы автоматически.
4. Файл .htaccess отключает кэш для HTML и разрешает долгий кэш для версионированных статических файлов. Если хостинг не Apache, настрой аналогичные заголовки: HTML — Cache-Control: no-cache, no-store, must-revalidate; статика — Cache-Control: public, max-age=31536000, immutable.
