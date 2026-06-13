<?php
/**
 * API для таблицы лидеров 38-0-0.
 *
 * 1. Залей этот файл на хостинг как /api/leaderboard.php.
 * 2. Впиши доступы к MySQL ниже.
 * 3. Таблица должна содержать поля: id, nickname, score, formation, played_at.
 *    Для точного лидерборда добавь поля: wins, draws, losses, points.
 */

declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'database';
const DB_USER = 'h210331';
const DB_PASS = 'QPH6n(4w]H2cxQ%s';
const MAX_NICKNAME_LENGTH = 24;
const MAX_FORMATION_LENGTH = 5;
const MAX_LEADERBOARD_ROWS = 50;
const PERFECT_SCORE = 100;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = createConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        sendJson(loadLeaderboard($pdo, getLeaderboardView(), getLeaderboardLimit()));
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        saveLeaderboardEntry($pdo, readJsonBody());
        sendJson(['ok' => true], 201);
    }

    sendJson(['error' => 'Method not allowed'], 405);
} catch (InvalidArgumentException $exception) {
    sendJson(['error' => $exception->getMessage()], 400);
} catch (Throwable $exception) {
    error_log('Leaderboard API error: ' . $exception->getMessage());
    sendJson(['error' => 'Internal server error'], 500);
}

function sendCorsHeaders(): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $allowedOrigins = [
        'https://38-0-0.ru',
        'https://www.38-0-0.ru',
    ];

    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

function createConnection(): PDO
{
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

/**
 * @return array<int, array{nickname: string, score: int, formation: string, playedAt: string}>
 */
function loadLeaderboard(PDO $pdo, string $view, int $limit): array
{
    $hasFormation = leaderboardHasColumn($pdo, 'formation');
    $hasSeasonRecord = leaderboardHasSeasonRecord($pdo);
    $columns = ['nickname', 'score', 'played_at'];
    if ($hasFormation) {
        $columns[] = 'formation';
    }
    if ($hasSeasonRecord) {
        array_push($columns, 'wins', 'draws', 'losses', 'points');
    }
    $columnsSql = implode(', ', $columns);
    $where = $view === 'perfect'
        ? ($hasSeasonRecord ? 'WHERE wins = 38 AND draws = 0 AND losses = 0' : 'WHERE score >= :perfect_score')
        : '';
    $orderBy = $view === 'recent' || $view === 'perfect'
        ? 'played_at DESC, id DESC'
        : 'score DESC, played_at DESC, id DESC';

    $statement = $pdo->prepare(
        "SELECT {$columnsSql}
         FROM leaderboard
         {$where}
         ORDER BY {$orderBy}
         LIMIT :limit"
    );

    if ($view === 'perfect' && !$hasSeasonRecord) {
        $statement->bindValue(':perfect_score', PERFECT_SCORE, PDO::PARAM_INT);
    }
    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->execute();

    return array_map(static function (array $row) use ($hasFormation, $hasSeasonRecord): array {
        $entry = [
            'nickname' => (string) $row['nickname'],
            'score' => (int) $row['score'],
            'formation' => $hasFormation ? (string) $row['formation'] : '',
            'playedAt' => mysqlDateTimeToIso((string) $row['played_at']),
        ];

        if ($hasSeasonRecord) {
            $entry['wins'] = (int) $row['wins'];
            $entry['draws'] = (int) $row['draws'];
            $entry['losses'] = (int) $row['losses'];
            $entry['points'] = ((int) $row['wins'] * 3) + (int) $row['draws'];
        }

        return $entry;
    }, $statement->fetchAll());
}

/**
 * @param array<string, mixed> $payload
 */
function saveLeaderboardEntry(PDO $pdo, array $payload): void
{
    $nickname = normalizeNickname($payload['nickname'] ?? '');
    $score = normalizeScore($payload['score'] ?? null);
    $formation = normalizeFormation($payload['formation'] ?? '');
    $playedAt = gmdate('Y-m-d H:i:s');
    $seasonRecord = normalizeSeasonRecord($payload);
    $hasFormation = leaderboardHasColumn($pdo, 'formation');
    $hasSeasonRecord = leaderboardHasSeasonRecord($pdo);

    if (updateExistingLeaderboardEntry($pdo, $nickname, $score, $formation, $playedAt, $seasonRecord, $hasFormation, $hasSeasonRecord)) {
        return;
    }

    insertLeaderboardEntry($pdo, $nickname, $score, $formation, $playedAt, $seasonRecord, $hasFormation, $hasSeasonRecord);
}

/**
 * @param array{wins: int, draws: int, losses: int, points: int} $seasonRecord
 */
function insertLeaderboardEntry(
    PDO $pdo,
    string $nickname,
    int $score,
    string $formation,
    string $playedAt,
    array $seasonRecord,
    bool $hasFormation,
    bool $hasSeasonRecord
): void {
    $columns = ['nickname', 'score'];
    $placeholders = [':nickname', ':score'];
    $values = [
        ':nickname' => $nickname,
        ':score' => $score,
    ];

    if ($hasFormation) {
        $columns[] = 'formation';
        $placeholders[] = ':formation';
        $values[':formation'] = $formation;
    }

    if ($hasSeasonRecord) {
        array_push($columns, 'wins', 'draws', 'losses', 'points');
        array_push($placeholders, ':wins', ':draws', ':losses', ':points');
        $values[':wins'] = $seasonRecord['wins'];
        $values[':draws'] = $seasonRecord['draws'];
        $values[':losses'] = $seasonRecord['losses'];
        $values[':points'] = $seasonRecord['points'];
    }

    $columns[] = 'played_at';
    $placeholders[] = ':played_at';
    $values[':played_at'] = $playedAt;

    try {
        $statement = $pdo->prepare(sprintf(
            'INSERT INTO leaderboard (%s) VALUES (%s)',
            implode(', ', $columns),
            implode(', ', $placeholders)
        ));
        $statement->execute($values);
    } catch (PDOException $exception) {
        if ($exception->getCode() !== '23000') {
            throw $exception;
        }

        // Если между проверкой и INSERT такой никнейм уже появился, обновляем существующую запись.
        updateExistingLeaderboardEntry($pdo, $nickname, $score, $formation, $playedAt, $seasonRecord, $hasFormation, $hasSeasonRecord);
    }
}

/**
 * @param array{wins: int, draws: int, losses: int, points: int} $seasonRecord
 */
function updateExistingLeaderboardEntry(
    PDO $pdo,
    string $nickname,
    int $score,
    string $formation,
    string $playedAt,
    array $seasonRecord,
    bool $hasFormation,
    bool $hasSeasonRecord
): bool {
    $entryId = findLeaderboardEntryIdByNickname($pdo, $nickname);
    if ($entryId === null) {
        return false;
    }

    $sets = ['score = :score'];
    $values = [
        ':id' => $entryId,
        ':score' => $score,
        ':played_at' => $playedAt,
    ];

    if ($hasFormation) {
        $sets[] = 'formation = :formation';
        $values[':formation'] = $formation;
    }

    if ($hasSeasonRecord) {
        array_push($sets, 'wins = :wins', 'draws = :draws', 'losses = :losses', 'points = :points');
        $values[':wins'] = $seasonRecord['wins'];
        $values[':draws'] = $seasonRecord['draws'];
        $values[':losses'] = $seasonRecord['losses'];
        $values[':points'] = $seasonRecord['points'];
    }

    $sets[] = 'played_at = :played_at';

    $statement = $pdo->prepare(sprintf(
        'UPDATE leaderboard SET %s WHERE id = :id',
        implode(', ', $sets)
    ));
    $statement->execute($values);

    return true;
}

function findLeaderboardEntryIdByNickname(PDO $pdo, string $nickname): ?int
{
    $statement = $pdo->prepare(
        'SELECT id
         FROM leaderboard
         WHERE nickname = :nickname
         ORDER BY id ASC
         LIMIT 1'
    );
    $statement->execute([':nickname' => $nickname]);
    $entryId = $statement->fetchColumn();

    if ($entryId === false) {
        return null;
    }

    return (int) $entryId;
}

/**
 * @return array<string, mixed>
 */
function readJsonBody(): array
{
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody === false ? '' : $rawBody, true);

    if (!is_array($payload)) {
        throw new InvalidArgumentException('Invalid JSON body');
    }

    return $payload;
}

/**
 * @param array<string, mixed> $payload
 * @return array{wins: int, draws: int, losses: int, points: int}
 */
function normalizeSeasonRecord(array $payload): array
{
    $wins = normalizeNonNegativeInt($payload['wins'] ?? 0);
    $draws = normalizeNonNegativeInt($payload['draws'] ?? 0);
    $losses = normalizeNonNegativeInt($payload['losses'] ?? 0);
    $points = ($wins * 3) + $draws;

    if (($wins + $draws + $losses) !== 38) {
        $wins = 0;
        $draws = 0;
        $losses = 38;
        $points = 0;
    } else {
        $points = ($wins * 3) + $draws;
    }

    return [
        'wins' => $wins,
        'draws' => $draws,
        'losses' => $losses,
        'points' => $points,
    ];
}

function normalizeNonNegativeInt($value): int
{
    if (!is_numeric($value)) {
        return 0;
    }

    return max(0, (int) $value);
}

function normalizeNickname($value): string
{
    $nickname = trim(preg_replace('/\s+/u', ' ', (string) $value) ?? '');

    if ($nickname === '') {
        $nickname = 'Игрок';
    }

    if (function_exists('mb_substr')) {
        return mb_substr($nickname, 0, MAX_NICKNAME_LENGTH, 'UTF-8');
    }

    return substr($nickname, 0, MAX_NICKNAME_LENGTH);
}

function normalizeScore($value): int
{
    if (!is_numeric($value)) {
        throw new InvalidArgumentException('Invalid score');
    }

    $score = (int) $value;
    if ($score < 0 || $score > 100) {
        throw new InvalidArgumentException('Score is out of range');
    }

    return $score;
}

function normalizeFormation($value): string
{
    $formation = trim((string) $value);
    if (!preg_match('/^[3-5]-[2-5]-[1-4]$/', $formation)) {
        return '';
    }

    return substr($formation, 0, MAX_FORMATION_LENGTH);
}

function getLeaderboardView(): string
{
    $view = strtolower((string) ($_GET['view'] ?? 'top'));
    return in_array($view, ['top', 'recent', 'perfect'], true) ? $view : 'top';
}

function getLeaderboardLimit(): int
{
    $limit = (int) ($_GET['limit'] ?? MAX_LEADERBOARD_ROWS);
    if ($limit < 1) {
        return 1;
    }

    return min($limit, MAX_LEADERBOARD_ROWS);
}

function leaderboardHasColumn(PDO $pdo, string $columnName): bool
{
    static $cache = [];

    if (array_key_exists($columnName, $cache)) {
        return $cache[$columnName];
    }

    $statement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table_name
           AND COLUMN_NAME = :column_name'
    );
    $statement->execute([
        ':table_name' => 'leaderboard',
        ':column_name' => $columnName,
    ]);

    $cache[$columnName] = (int) $statement->fetchColumn() > 0;
    return $cache[$columnName];
}

function leaderboardHasSeasonRecord(PDO $pdo): bool
{
    return leaderboardHasColumn($pdo, 'wins')
        && leaderboardHasColumn($pdo, 'draws')
        && leaderboardHasColumn($pdo, 'losses')
        && leaderboardHasColumn($pdo, 'points');
}

function mysqlDateTimeToIso(string $value): string
{
    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return gmdate('c');
    }

    return gmdate('c', $timestamp);
}

function sendJson($payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
