<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/db.php';

$username = trim($argv[1] ?? '');
if (!preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $username)) {
    fwrite(STDERR, "Usage: php setup-admin.php <username>\nUsername must be 3–40 letters, numbers, dots, underscores, or hyphens.\n");
    exit(1);
}

fwrite(STDOUT, "Administrator password (minimum 12 characters): ");
$password = trim((string) fgets(STDIN));
if (strlen($password) < 12) {
    fwrite(STDERR, "\nPassword must be at least 12 characters.\n");
    exit(1);
}

$email = trim((string) ($argv[2] ?? 'admin@campuscash.local'));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Provide a valid email address as the optional second argument.\n");
    exit(1);
}

try {
    $pdo = campusCashDatabase();
    $pdo->prepare('INSERT INTO organizations (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)')
        ->execute(['CTU BSIT Society']);
    $organizationId = (int) $pdo->lastInsertId();
    $existing = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $existing->execute([$username]);
    $existingId = $existing->fetchColumn();
    if ($existingId) {
        $pdo->prepare(
            "UPDATE users SET organization_id = ?, email = ?, password_hash = ?, full_name = 'CampusCash Administrator', account_role = 'admin', member_role = 'Administrator', status = 'Active' WHERE id = ?"
        )->execute([$organizationId, $email, password_hash($password, PASSWORD_DEFAULT), $existingId]);
    } else {
        $pdo->prepare(
            "INSERT INTO users (id, organization_id, username, email, password_hash, full_name, account_role, member_role, status)
             VALUES (?, ?, ?, ?, ?, 'CampusCash Administrator', 'admin', 'Administrator', 'Active')"
        )->execute(['user-' . bin2hex(random_bytes(12)), $organizationId, $username, $email, password_hash($password, PASSWORD_DEFAULT)]);
    }
    fwrite(STDOUT, "Administrator account is ready for the hidden admin portal.\n");
} catch (Throwable $error) {
    fwrite(STDERR, "Could not create administrator account: {$error->getMessage()}\n");
    exit(1);
}
