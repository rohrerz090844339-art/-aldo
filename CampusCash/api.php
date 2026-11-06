<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

session_set_cookie_params([
    'httponly' => true,
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
]);
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestData(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $decoded = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($decoded)) {
            respond(['error' => 'Invalid JSON request.'], 400);
        }
        return $decoded;
    }
    return $_POST;
}

function requiredText(array $data, string $key, int $maxLength): string
{
    $value = trim((string) ($data[$key] ?? ''));
    if ($value === '' || mb_strlen($value) > $maxLength) {
        respond(['error' => "Please provide a valid {$key}."], 422);
    }
    return $value;
}

function currentUser(PDO $pdo): array
{
    $userId = $_SESSION['user_id'] ?? '';
    if ($userId === '') {
        respond(['error' => 'Please sign in to continue.'], 401);
    }
    $statement = $pdo->prepare(
        'SELECT u.id, u.organization_id, u.username, u.email, u.full_name, u.account_role, u.member_role, u.status, o.name AS organization
         FROM users u JOIN organizations o ON o.id = u.organization_id WHERE u.id = ?'
    );
    $statement->execute([$userId]);
    $user = $statement->fetch();
    if (!$user || $user['status'] !== 'Active') {
        session_destroy();
        respond(['error' => 'This account is unavailable. Please contact your organization administrator.'], 401);
    }
    return $user;
}

function requireRole(array $user, string $role): void
{
    if ($user['account_role'] !== $role) {
        respond(['error' => 'You do not have permission to perform this action.'], 403);
    }
}

function logActivity(PDO $pdo, array $user, string $action, string $detail): void
{
    $statement = $pdo->prepare(
        'INSERT INTO activities (id, organization_id, date, actor, action, detail) VALUES (?, ?, NOW(), ?, ?, ?)'
    );
    $statement->execute([entityId('log'), $user['organization_id'], $user['full_name'], $action, $detail]);
}

function entityId(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(12));
}

function validAmount(array $data): string
{
    $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($amount === false || $amount <= 0 || $amount > 9999999999) {
        respond(['error' => 'Enter an amount greater than zero.'], 422);
    }
    return number_format($amount, 2, '.', '');
}

function organizationIdFor(PDO $pdo, string $name): int
{
    $pdo->prepare('INSERT INTO organizations (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)')
        ->execute([$name]);
    return (int) $pdo->lastInsertId();
}

function stateFor(PDO $pdo, array $user): array
{
    $organizationId = (int) $user['organization_id'];
    $members = $pdo->prepare(
        "SELECT id, full_name AS name, email, member_role AS role, account_role, status
         FROM users WHERE organization_id = ? ORDER BY (account_role = 'admin') DESC, full_name"
    );
    $members->execute([$organizationId]);

    $transactions = $pdo->prepare(
        'SELECT id, date, description, category, type, amount, member_name AS member, status, COALESCE(receipt, \'\') AS receipt
         FROM transactions WHERE organization_id = ? ORDER BY date DESC, created_at DESC'
    );
    $transactions->execute([$organizationId]);

    $budgets = $pdo->prepare('SELECT id, name, category, allocated FROM budgets WHERE organization_id = ? ORDER BY name');
    $budgets->execute([$organizationId]);

    $announcements = $pdo->prepare(
        'SELECT id, title, body, date, status FROM announcements WHERE organization_id = ? AND (? = \'admin\' OR status = \'Published\') ORDER BY date DESC'
    );
    $announcements->execute([$organizationId, $user['account_role']]);

    $proofQuery = $user['account_role'] === 'admin'
        ? 'SELECT id, date, member_name AS member, member_email AS email, amount, note, COALESCE(file_name, \'\') AS file, status FROM proofs WHERE organization_id = ? ORDER BY date DESC'
        : 'SELECT id, date, member_name AS member, member_email AS email, amount, note, COALESCE(file_name, \'\') AS file, status FROM proofs WHERE organization_id = ? AND member_email = ? ORDER BY date DESC';
    $proofs = $pdo->prepare($proofQuery);
    $proofs->execute($user['account_role'] === 'admin' ? [$organizationId] : [$organizationId, $user['email']]);

    $activities = $pdo->prepare(
        'SELECT id, date, actor, action, detail FROM activities WHERE organization_id = ? ORDER BY date DESC LIMIT 100'
    );
    $activities->execute([$organizationId]);

    return [
        'organization' => $user['organization'],
        'transactions' => $transactions->fetchAll(),
        'budgets' => $budgets->fetchAll(),
        'members' => $members->fetchAll(),
        'announcements' => $announcements->fetchAll(),
        'proofs' => $proofs->fetchAll(),
        'activities' => $activities->fetchAll(),
    ];
}

function saveAdminState(PDO $pdo, array $user, array $data): void
{
    requireRole($user, 'admin');
    $organizationId = (int) $user['organization_id'];
    $organizationName = requiredText(['organization' => $data['organization'] ?? ''], 'organization', 120);

    $pdo->beginTransaction();
    try {
        $pdo->prepare('UPDATE organizations SET name = ? WHERE id = ?')->execute([$organizationName, $organizationId]);
        $collectionTables = ['transactions', 'budgets', 'announcements', 'proofs', 'activities'];
        foreach ($collectionTables as $table) {
            $pdo->prepare("DELETE FROM {$table} WHERE organization_id = ?")->execute([$organizationId]);
        }

        foreach (($data['transactions'] ?? []) as $item) {
            $type = in_array($item['type'] ?? '', ['income', 'expense', 'contribution'], true) ? $item['type'] : null;
            $status = in_array($item['status'] ?? '', ['approved', 'pending', 'rejected'], true) ? $item['status'] : 'approved';
            if (!$type || empty($item['id']) || empty($item['description'])) {
                continue;
            }
            $pdo->prepare(
                'INSERT INTO transactions (id, organization_id, date, description, category, type, amount, member_name, status, receipt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                substr((string) $item['id'], 0, 64), $organizationId, validDate($item['date'] ?? null),
                requiredText(['description' => $item['description']], 'description', 190),
                substr(trim((string) ($item['category'] ?? 'General')), 0, 80), $type, validAmount($item),
                substr(trim((string) ($item['member'] ?? $user['full_name'])), 0, 120), $status,
                nullableText($item['receipt'] ?? null, 255),
            ]);
        }

        foreach (($data['budgets'] ?? []) as $item) {
            if (empty($item['id']) || empty($item['name'])) {
                continue;
            }
            $pdo->prepare('INSERT INTO budgets (id, organization_id, name, category, allocated) VALUES (?, ?, ?, ?, ?)')
                ->execute([
                    substr((string) $item['id'], 0, 64), $organizationId,
                    requiredText(['name' => $item['name']], 'name', 120),
                    substr(trim((string) ($item['category'] ?? 'General')), 0, 80), validAmount(['amount' => $item['allocated'] ?? null]),
                ]);
        }

        $memberIds = [];
        foreach (($data['members'] ?? []) as $member) {
            if (empty($member['email']) || empty($member['name'])) {
                continue;
            }
            $email = filter_var(trim((string) $member['email']), FILTER_VALIDATE_EMAIL);
            if (!$email) {
                continue;
            }
            $memberRole = substr(trim((string) ($member['role'] ?? 'Member')), 0, 40);
            $status = ($member['status'] ?? 'Active') === 'Inactive' ? 'Inactive' : 'Active';
            $memberId = substr((string) ($member['id'] ?? entityId('user')), 0, 36);
            $memberIds[] = $memberId;
            $existing = $pdo->prepare('SELECT id FROM users WHERE organization_id = ? AND email = ? LIMIT 1');
            $existing->execute([$organizationId, $email]);
            $existingId = $existing->fetchColumn();
            if ($existingId) {
                $pdo->prepare('UPDATE users SET full_name = ?, member_role = ?, status = ? WHERE id = ? AND account_role = \'member\'')
                    ->execute([substr(trim((string) $member['name']), 0, 120), $memberRole, $status, $existingId]);
            } else {
                $pdo->prepare(
                    'INSERT INTO users (id, organization_id, email, full_name, account_role, member_role, status) VALUES (?, ?, ?, ?, \'member\', ?, ?)'
                )->execute([$memberId, $organizationId, $email, substr(trim((string) $member['name']), 0, 120), $memberRole, $status]);
            }
        }
        $memberIds = array_values(array_filter($memberIds, static fn($id) => $id !== ''));
        if ($memberIds) {
            $placeholders = implode(',', array_fill(0, count($memberIds), '?'));
            $pdo->prepare("DELETE FROM users WHERE organization_id = ? AND account_role = 'member' AND id NOT IN ({$placeholders}) AND password_hash IS NULL")
                ->execute(array_merge([$organizationId], $memberIds));
        }

        foreach (($data['announcements'] ?? []) as $item) {
            if (empty($item['id']) || empty($item['title']) || empty($item['body'])) {
                continue;
            }
            $status = ($item['status'] ?? 'Published') === 'Draft' ? 'Draft' : 'Published';
            $pdo->prepare('INSERT INTO announcements (id, organization_id, title, body, date, status) VALUES (?, ?, ?, ?, ?, ?)')
                ->execute([
                    substr((string) $item['id'], 0, 64), $organizationId,
                    requiredText(['title' => $item['title']], 'title', 190),
                    substr(trim((string) $item['body']), 0, 5000), validDate($item['date'] ?? null), $status,
                ]);
        }

        foreach (($data['proofs'] ?? []) as $proof) {
            if (empty($proof['id']) || empty($proof['member']) || empty($proof['email'])) {
                continue;
            }
            $status = in_array($proof['status'] ?? '', ['Pending', 'Approved', 'Rejected'], true) ? $proof['status'] : 'Pending';
            $pdo->prepare(
                'INSERT INTO proofs (id, organization_id, date, member_name, member_email, amount, note, file_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                substr((string) $proof['id'], 0, 64), $organizationId, validDate($proof['date'] ?? null),
                substr(trim((string) $proof['member']), 0, 120), substr(trim((string) $proof['email']), 0, 190),
                validAmount($proof), substr(trim((string) ($proof['note'] ?? '')), 0, 255),
                nullableText($proof['file'] ?? null, 255), $status,
            ]);
        }

        foreach (($data['activities'] ?? []) as $activity) {
            if (empty($activity['id']) || empty($activity['action'])) {
                continue;
            }
            $pdo->prepare('INSERT INTO activities (id, organization_id, date, actor, action, detail) VALUES (?, ?, ?, ?, ?, ?)')
                ->execute([
                    substr((string) $activity['id'], 0, 64), $organizationId, validDate($activity['date'] ?? null),
                    substr(trim((string) ($activity['actor'] ?? $user['full_name'])), 0, 120),
                    substr(trim((string) $activity['action']), 0, 190), substr(trim((string) ($activity['detail'] ?? '')), 0, 500),
                ]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function saveMemberState(PDO $pdo, array $user, array $data): void
{
    requireRole($user, 'member');
    if (isset($data['currentUser'])) {
        $profile = $data['currentUser'];
        $name = requiredText(['name' => $profile['name'] ?? ''], 'name', 120);
        $email = filter_var(trim((string) ($profile['email'] ?? '')), FILTER_VALIDATE_EMAIL);
        if (!$email) {
            respond(['error' => 'Enter a valid email address.'], 422);
        }
        $pdo->prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?')
            ->execute([$name, $email, $user['id']]);
    }

    $existingProofs = $pdo->prepare('SELECT id FROM proofs WHERE organization_id = ? AND member_email = ?');
    $existingProofs->execute([$user['organization_id'], $user['email']]);
    $existingIds = array_flip($existingProofs->fetchAll(PDO::FETCH_COLUMN));
    foreach (($data['proofs'] ?? []) as $proof) {
        $proofEmail = trim((string) ($proof['email'] ?? $user['email']));
        if (empty($proof['id']) || isset($existingIds[$proof['id']]) || ($proofEmail !== '' && $proofEmail !== $user['email'])) {
            continue;
        }
        $pdo->prepare(
            'INSERT INTO proofs (id, organization_id, date, member_name, member_email, amount, note, file_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'Pending\')'
        )->execute([
            substr((string) $proof['id'], 0, 64), $user['organization_id'], validDate($proof['date'] ?? null),
            $user['full_name'], $user['email'], validAmount($proof),
            substr(trim((string) ($proof['note'] ?? '')), 0, 255), nullableText($proof['file'] ?? null, 255),
        ]);
        logActivity($pdo, $user, 'Submitted payment proof', money_format_local((float) $proof['amount']));
    }
}

function validDate(mixed $value): string
{
    if (!is_string($value) || trim($value) === '') {
        return date('Y-m-d H:i:s');
    }
    try {
        return (new DateTimeImmutable($value))->format('Y-m-d H:i:s');
    } catch (Throwable) {
        return date('Y-m-d H:i:s');
    }
}

function nullableText(mixed $value, int $limit): ?string
{
    $text = trim((string) ($value ?? ''));
    return $text === '' ? null : substr($text, 0, $limit);
}

function money_format_local(float $amount): string
{
    return 'PHP ' . number_format($amount, 2);
}

try {
    $pdo = campusCashDatabase();
    $action = $_GET['action'] ?? '';
    if ($action === 'health' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        respond(['ok' => true, 'database' => getenv('CAMPUSCASH_DB_NAME') ?: 'campuscash']);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && !in_array($action, ['login', 'register'], true)) {
        $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals((string) $_SESSION['csrf_token'], $csrf)) {
            respond(['error' => 'Your session expired. Refresh the page and try again.'], 419);
        }
    }

    if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $portal = ($_GET['portal'] ?? 'member') === 'admin' ? 'admin' : 'member';
        $accountRole = $portal === 'admin' ? 'admin' : 'member';
        $memberRole = $portal === 'admin' ? 'Treasurer' : 'Member';

        $data = requestData();
        $name = requiredText($data, 'name', 120);
        $username = requiredText($data, 'username', 40);
        $email = filter_var(trim((string) ($data['email'] ?? '')), FILTER_VALIDATE_EMAIL);
        $password = (string) ($data['password'] ?? '');
        $organization = requiredText($data, 'organization', 120);
        if (!$email || strlen($password) < 8) {
            respond(['error' => 'Enter a valid email and a password of at least 8 characters.'], 422);
        }
        if (!preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $username)) {
            respond(['error' => 'Username must be 3–40 characters using letters, numbers, dots, underscores, or hyphens.'], 422);
        }

        $organizationId = organizationIdFor($pdo, $organization);
        $userId = entityId('user');
        try {
            $pdo->prepare(
                'INSERT INTO users (id, organization_id, username, email, password_hash, full_name, account_role, member_role, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'Active\')'
            )->execute([$userId, $organizationId, $username, $email, password_hash($password, PASSWORD_DEFAULT), $name, $accountRole, $memberRole]);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                respond(['error' => 'That username or email is already registered.'], 409);
            }
            throw $error;
        }

        if ($accountRole === 'admin') {
            $budgetCount = (int) $pdo->query("SELECT count(*) FROM budgets WHERE organization_id = {$organizationId}")->fetchColumn();
            if ($budgetCount === 0) {
                $initBudgets = [
                    ['Events & workshops', 'Events', 10000.00],
                    ['Merchandise', 'Merchandise', 5000.00],
                    ['Operations', 'Operations', 4000.00],
                    ['Outreach', 'Outreach', 3000.00],
                ];
                $stmtB = $pdo->prepare('INSERT INTO budgets (id, organization_id, name, category, allocated) VALUES (?, ?, ?, ?, ?)');
                foreach ($initBudgets as [$bName, $bCat, $bAlloc]) {
                    $stmtB->execute([entityId('b'), $organizationId, $bName, $bCat, $bAlloc]);
                }
            }

            $annCount = (int) $pdo->query("SELECT count(*) FROM announcements WHERE organization_id = {$organizationId}")->fetchColumn();
            if ($annCount === 0) {
                $pdo->prepare('INSERT INTO announcements (id, organization_id, title, body, date, status) VALUES (?, ?, ?, ?, NOW(), \'Published\')')
                    ->execute([
                        entityId('a'),
                        $organizationId,
                        "Welcome to {$organization}",
                        "Welcome to our organization financial workspace. All transactions, dues, and budgets are tracked transparently."
                    ]);
            }

            $pdo->prepare('INSERT INTO activities (id, organization_id, date, actor, action, detail) VALUES (?, ?, NOW(), ?, ?, ?)')
                ->execute([entityId('log'), $organizationId, $name, 'Created organization workspace', "Registered as treasurer for {$organization}"]);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        respond(['user' => ['id' => $userId, 'username' => $username, 'name' => $name, 'email' => $email, 'role' => $accountRole], 'csrfToken' => $_SESSION['csrf_token']]);
    }

    if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = requestData();
        $username = requiredText($data, 'username', 40);
        $password = (string) ($data['password'] ?? '');
        $portal = ($_GET['portal'] ?? 'member') === 'admin' ? 'admin' : 'member';
        $statement = $pdo->prepare('SELECT id, username, email, full_name, account_role, password_hash, status FROM users WHERE username = ? LIMIT 1');
        $statement->execute([$username]);
        $account = $statement->fetch();
        if (!$account || !$account['password_hash'] || $account['status'] !== 'Active' ||
            $account['account_role'] !== $portal || !password_verify($password, $account['password_hash'])) {
            respond(['error' => 'Username or password is incorrect.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $account['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        respond([
            'user' => ['id' => $account['id'], 'username' => $account['username'], 'name' => $account['full_name'], 'email' => $account['email'], 'role' => $account['account_role']],
            'csrfToken' => $_SESSION['csrf_token'],
        ]);
    }

    if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $_SESSION = [];
        session_destroy();
        respond(['ok' => true]);
    }

    if ($action === 'state' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = currentUser($pdo);
        respond([
            'user' => ['id' => $user['id'], 'username' => $user['username'], 'name' => $user['full_name'], 'email' => $user['email'], 'role' => $user['account_role']],
            'csrfToken' => $_SESSION['csrf_token'],
            'state' => stateFor($pdo, $user),
        ]);
    }

    if ($action === 'save-state' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = currentUser($pdo);
        $data = requestData();
        if ($user['account_role'] === 'admin') {
            saveAdminState($pdo, $user, $data['state'] ?? []);
        } else {
            saveMemberState($pdo, $user, $data['state'] ?? []);
        }
        respond(['ok' => true]);
    }

    respond(['error' => 'Unknown API action.'], 404);
} catch (Throwable $error) {
    error_log('CampusCash API error: ' . $error->getMessage());
    respond(['error' => 'The database request failed. Check the XAMPP MySQL service and database configuration.'], 500);
}
