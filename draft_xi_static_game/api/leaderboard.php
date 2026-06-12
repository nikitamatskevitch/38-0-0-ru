<?php
/**
 * API для таблицы лидеров 38-0-0.
 *
 * 1. Залей этот файл на хостинг как /api/leaderboard.php.
 * 2. Впиши доступы к MySQL ниже.
 * 3. Таблица должна содержать поля: id, nickname, score, played_at.
 */

declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'database';
const DB_USER = 'database_user';
const DB_PASS = 'database_password';
const MAX_NICKNAME_LENGTH = 24;
const MAX_LEADERBOARD_ROWS = 50;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = createConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        sendJson(loadLeaderboard($pdo));
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
 * @return array<int, array{nickname: string, score: int, playedAt: string}>
 */
function loadLeaderboard(PDO $pdo): array
{
    $statement = $pdo->prepare(
        'SELECT nickname, score, played_at
         FROM leaderboard
         ORDER BY score DESC, played_at DESC
         LIMIT :limit'
    );
    $statement->bindValue(':limit', MAX_LEADERBOARD_ROWS, PDO::PARAM_INT);
    $statement->execute();

    return array_map(static function (array $row): array {
        return [
            'nickname' => (string) $row['nickname'],
            'score' => (int) $row['score'],
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
    $playedAt = normalizePlayedAt($payload['playedAt'] ?? null);

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

function normalizePlayedAt($value): string
{
    if (is_string($value) && $value !== '') {
        $timestamp = strtotime($value);
        if ($timestamp !== false) {
            return gmdate('Y-m-d H:i:s', $timestamp);
        }
    }

    return gmdate('Y-m-d H:i:s');
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
