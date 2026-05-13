<?php

const DEFAULT_USER_EMAIL = 'password@gmail.com';
const DEFAULT_USER_PASSWORD = 'pass';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$dataDirectory = dirname(__DIR__).'/database/auth';
$usersFile = $dataDirectory.'/users.json';
$sessionsFile = $dataDirectory.'/sessions.json';
$bookingsFile = $dataDirectory.'/bookings.json';
$ordersFile = $dataDirectory.'/orders.json';
$listingsFile = $dataDirectory.'/listings.json';
$exchangesFile = $dataDirectory.'/exchanges.json';
$contactsFile = $dataDirectory.'/contact_requests.json';

if (! is_dir($dataDirectory)) {
    mkdir($dataDirectory, 0777, true);
}

header('Access-Control-Allow-Origin: http://127.0.0.1:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function readJsonFile(string $file, array $fallback): array
{
    if (! file_exists($file)) {
        return $fallback;
    }

    $data = json_decode((string) file_get_contents($file), true);

    return is_array($data) ? $data : $fallback;
}

function writeJsonFile(string $file, array $data): void
{
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function sendJson(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function requestBody(): array
{
    $body = json_decode((string) file_get_contents('php://input'), true);

    return is_array($body) ? $body : [];
}

function publicUser(array $user): array
{
    return [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'createdAt' => $user['created_at'],
    ];
}

function seedDefaultUser(string $usersFile): void
{
    $users = readJsonFile($usersFile, []);

    foreach ($users as $user) {
        if (($user['email'] ?? '') === DEFAULT_USER_EMAIL) {
            return;
        }
    }

    $users[] = [
        'id' => count($users) + 1,
        'name' => 'Password User',
        'email' => DEFAULT_USER_EMAIL,
        'phone' => '+216 00 000 000',
        'password_hash' => password_hash(DEFAULT_USER_PASSWORD, PASSWORD_DEFAULT),
        'created_at' => date(DATE_ATOM),
    ];

    writeJsonFile($usersFile, $users);
}

function findUserByEmail(array $users, string $email): ?array
{
    foreach ($users as $user) {
        if (($user['email'] ?? '') === $email) {
            return $user;
        }
    }

    return null;
}

function authenticatedUser(string $usersFile, string $sessionsFile): ?array
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_starts_with($authorization, 'Bearer ')
        ? substr($authorization, strlen('Bearer '))
        : '';

    if ($token === '') {
        return null;
    }

    $tokenHash = hash('sha256', $token);
    $sessions = readJsonFile($sessionsFile, []);
    $users = readJsonFile($usersFile, []);

    foreach ($sessions as $session) {
        if (($session['token_hash'] ?? '') !== $tokenHash) {
            continue;
        }

        foreach ($users as $user) {
            if (($user['id'] ?? null) === ($session['user_id'] ?? null)) {
                return $user;
            }
        }
    }

    return null;
}

function createSession(string $sessionsFile, int $userId): string
{
    $sessions = readJsonFile($sessionsFile, []);
    $token = bin2hex(random_bytes(32));
    $sessions[] = [
        'user_id' => $userId,
        'token_hash' => hash('sha256', $token),
        'created_at' => date(DATE_ATOM),
    ];

    writeJsonFile($sessionsFile, $sessions);

    return $token;
}

function appendRecord(string $file, array $data): array
{
    $records = readJsonFile($file, []);
    $record = array_merge([
        'id' => count($records) + 1,
        'status' => $data['status'] ?? 'pending',
        'created_at' => date(DATE_ATOM),
    ], $data);
    $records[] = $record;
    writeJsonFile($file, $records);

    return $record;
}

seedDefaultUser($usersFile);

if ($method === 'POST' && $path === '/api/register') {
    $body = requestBody();
    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $phone = trim((string) ($body['phone'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    $users = readJsonFile($usersFile, []);

    if (strlen($name) < 2) {
        sendJson(422, ['message' => 'Le nom est obligatoire.']);
    }

    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(422, ['message' => 'Email invalide.']);
    }

    if (strlen($password) < 4) {
        sendJson(422, ['message' => 'Le mot de passe doit contenir au moins 4 caracteres.']);
    }

    if (findUserByEmail($users, $email)) {
        sendJson(409, ['message' => 'Cet email existe deja.']);
    }

    $user = [
        'id' => count($users) + 1,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'created_at' => date(DATE_ATOM),
    ];

    $users[] = $user;
    writeJsonFile($usersFile, $users);

    sendJson(201, [
        'message' => 'Compte cree avec succes.',
        'token' => createSession($sessionsFile, $user['id']),
        'user' => publicUser($user),
    ]);
}

if ($method === 'POST' && $path === '/api/login') {
    $body = requestBody();
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $user = findUserByEmail(readJsonFile($usersFile, []), $email);

    if (! $user || ! password_verify($password, $user['password_hash'])) {
        sendJson(401, ['message' => 'Email ou mot de passe incorrect.']);
    }

    sendJson(200, [
        'message' => 'Connexion reussie.',
        'token' => createSession($sessionsFile, (int) $user['id']),
        'user' => publicUser($user),
    ]);
}

if ($method === 'GET' && $path === '/api/me') {
    $user = authenticatedUser($usersFile, $sessionsFile);

    if (! $user) {
        sendJson(401, ['message' => 'Non connecte.']);
    }

    sendJson(200, ['user' => publicUser($user)]);
}

if ($method === 'POST' && $path === '/api/logout') {
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_starts_with($authorization, 'Bearer ')
        ? substr($authorization, strlen('Bearer '))
        : '';

    if ($token !== '') {
        $tokenHash = hash('sha256', $token);
        $sessions = array_values(array_filter(
            readJsonFile($sessionsFile, []),
            fn (array $session): bool => ($session['token_hash'] ?? '') !== $tokenHash,
        ));
        writeJsonFile($sessionsFile, $sessions);
    }

    sendJson(200, ['message' => 'Deconnecte.']);
}

if ($method === 'POST' && $path === '/api/bookings') {
    $body = requestBody();
    $title = trim((string) ($body['rental_title'] ?? ''));

    if ($title === '') {
        sendJson(422, ['message' => 'Offre de location obligatoire.']);
    }

    $booking = appendRecord($bookingsFile, [
        'rental_title' => $title,
        'customer_name' => $body['customer_name'] ?? null,
        'customer_email' => $body['customer_email'] ?? null,
        'customer_phone' => $body['customer_phone'] ?? null,
        'booking_date' => $body['booking_date'] ?? null,
        'notes' => $body['notes'] ?? null,
        'status' => 'pending',
    ]);

    sendJson(201, ['message' => 'Booking cree avec succes.', 'booking' => $booking]);
}

if ($method === 'POST' && $path === '/api/orders') {
    $body = requestBody();
    $title = trim((string) ($body['product_title'] ?? ''));

    if ($title === '') {
        sendJson(422, ['message' => 'Produit obligatoire.']);
    }

    $order = appendRecord($ordersFile, [
        'product_title' => $title,
        'customer_name' => $body['customer_name'] ?? null,
        'customer_email' => $body['customer_email'] ?? null,
        'customer_phone' => $body['customer_phone'] ?? null,
        'notes' => $body['notes'] ?? null,
        'status' => 'pending',
    ]);

    sendJson(201, ['message' => 'Demande produit envoyee.', 'order' => $order]);
}

if ($method === 'GET' && $path === '/api/listings') {
    $users = readJsonFile($usersFile, []);
    $listings = array_reverse(readJsonFile($listingsFile, []));
    $listings = array_slice(array_map(function (array $listing) use ($users): array {
        $sellerName = null;

        foreach ($users as $user) {
            if (($user['id'] ?? null) === ($listing['user_id'] ?? null)) {
                $sellerName = $user['name'] ?? null;
                break;
            }
        }

        return array_merge($listing, ['seller_name' => $sellerName]);
    }, $listings), 0, 100);

    sendJson(200, ['listings' => $listings]);
}

if ($method === 'POST' && $path === '/api/listings') {
    $body = requestBody();
    $user = authenticatedUser($usersFile, $sessionsFile);
    $title = trim((string) ($body['title'] ?? ''));

    if ($title === '') {
        sendJson(422, ['message' => 'Titre annonce obligatoire.']);
    }

    $listing = appendRecord($listingsFile, [
        'user_id' => $user['id'] ?? null,
        'title' => $title,
        'category' => $body['category'] ?? null,
        'brand' => $body['brand'] ?? null,
        'model' => $body['model'] ?? null,
        'year' => $body['year'] ?? null,
        'size' => $body['size'] ?? null,
        'color' => $body['color'] ?? null,
        'frame_material' => $body['frame_material'] ?? null,
        'transmission' => $body['transmission'] ?? null,
        'brakes' => $body['brakes'] ?? null,
        'wheel_size' => $body['wheel_size'] ?? null,
        'price' => $body['price'] ?? null,
        'condition' => $body['condition'] ?? null,
        'location' => $body['location'] ?? null,
        'description' => $body['description'] ?? null,
        'image_url' => $body['image_url'] ?? null,
        'contact_preference' => $body['contact_preference'] ?? 'phone',
        'status' => 'pending',
    ]);

    sendJson(201, ['message' => 'Annonce creee avec succes.', 'listing' => $listing]);
}

if ($method === 'POST' && $path === '/api/exchanges') {
    $body = requestBody();
    $offeredItem = trim((string) ($body['offered_item'] ?? ''));

    if ($offeredItem === '') {
        sendJson(422, ['message' => 'Objet propose obligatoire.']);
    }

    $exchange = appendRecord($exchangesFile, [
        'offered_item' => $offeredItem,
        'wanted_item' => $body['wanted_item'] ?? null,
        'description' => $body['description'] ?? null,
        'status' => 'pending',
    ]);

    sendJson(201, ['message' => 'Demande d echange envoyee.', 'exchange' => $exchange]);
}

if ($method === 'POST' && $path === '/api/contact-requests') {
    $body = requestBody();
    $topic = trim((string) ($body['topic'] ?? ''));

    if ($topic === '') {
        sendJson(422, ['message' => 'Sujet obligatoire.']);
    }

    $contact = appendRecord($contactsFile, [
        'topic' => $topic,
        'name' => $body['name'] ?? null,
        'email' => $body['email'] ?? null,
        'phone' => $body['phone'] ?? null,
        'message' => $body['message'] ?? null,
        'status' => 'new',
    ]);

    sendJson(201, [
        'message' => 'Demande envoyee. Bisklet vous contactera rapidement.',
        'contact' => $contact,
    ]);
}

if ($path === '/' || $path === '/up') {
    sendJson(200, ['message' => 'Bisklet API is running.']);
}

sendJson(404, ['message' => 'Route introuvable.']);
