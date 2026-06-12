<?php
/**
 * API для таблицы лидеров 38-0-0.
 *
 * 1. Залей этот файл на хостинг как /api/leaderboard.php.
 * 2. Впиши доступы к MySQL ниже.
 * 3. Таблица должна содержать поля: id, nickname, score, formation, played_at.
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
    $columns = $hasFormation ? 'nickname, score, formation, played_at' : 'nickname, score, played_at';
    $where = $view === 'perfect' ? 'WHERE score >= :perfect_score' : '';
    $orderBy = $view === 'recent' || $view === 'perfect'
        ? 'played_at DESC, id DESC'
        : 'score DESC, played_at DESC, id DESC';

    $statement = $pdo->prepare(
        "SELECT {$columns}
         FROM leaderboard
         {$where}
         ORDER BY {$orderBy}
         LIMIT :limit"
    );

    if ($view === 'perfect') {
        $statement->bindValue(':perfect_score', PERFECT_SCORE, PDO::PARAM_INT);
    }
    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->execute();

    return array_map(static function (array $row) use ($hasFormation): array {
        return [
            'nickname' => (string) $row['nickname'],
            'score' => (int) $row['score'],
            'formation' => $hasFormation ? (string) $row['formation'] : '',
            'playedAt' => mysqlDateTimeToIso((string) $row['played_at']),
        ];
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

    if (leaderboardHasColumn($pdo, 'formation')) {
        $statement = $pdo->prepare(
            'INSERT INTO leaderboard (nickname, score, formation, played_at)
             VALUES (:nickname, :score, :formation, :played_at)'
        );
        $statement->execute([
            ':nickname' => $nickname,
            ':score' => $score,
            ':formation' => $formation,
            ':played_at' => $playedAt,
        ]);
        return;
    }

    $statement = $pdo->prepare(
        'INSERT INTO leaderboard (nickname, score, played_at)
         VALUES (:nickname, :score, :played_at)'
    );
    $statement->execute([
        ':nickname' => $nickname,
        ':score' => $score,
        ':played_at' => $playedAt,
    ]);
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
