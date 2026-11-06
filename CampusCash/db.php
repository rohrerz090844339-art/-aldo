<?php
declare(strict_types=1);

function campusCashDatabase(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('CAMPUSCASH_DB_HOST') ?: '127.0.0.1';
    $port = getenv('CAMPUSCASH_DB_PORT') ?: '3306';
    $database = getenv('CAMPUSCASH_DB_NAME') ?: 'campuscash';
    $username = getenv('CAMPUSCASH_DB_USER') ?: 'root';
    $password = getenv('CAMPUSCASH_DB_PASSWORD') ?: '';
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
        throw new RuntimeException('CAMPUSCASH_DB_NAME may contain only letters, numbers, and underscores.');
    }

    $server = new PDO(
        "mysql:host={$host};port={$port};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    $server->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    campusCashEnsureSchema($pdo);
    return $pdo;
}

function campusCashEnsureSchema(PDO $pdo): void
{
    $statements = [
        "CREATE TABLE IF NOT EXISTS organizations (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL UNIQUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            username VARCHAR(40) NULL,
            email VARCHAR(190) NOT NULL,
            password_hash VARCHAR(255) NULL,
            full_name VARCHAR(120) NOT NULL,
            account_role ENUM('member','admin') NOT NULL DEFAULT 'member',
            member_role VARCHAR(40) NOT NULL DEFAULT 'Member',
            status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_username (username),
            UNIQUE KEY uq_org_email (organization_id, email),
            CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            date DATETIME NOT NULL,
            description VARCHAR(190) NOT NULL,
            category VARCHAR(80) NOT NULL,
            type ENUM('income','expense','contribution') NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            member_name VARCHAR(120) NOT NULL,
            status ENUM('approved','pending','rejected') NOT NULL DEFAULT 'approved',
            receipt VARCHAR(255) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_transactions_org_date (organization_id, date),
            CONSTRAINT fk_transactions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS budgets (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(120) NOT NULL,
            category VARCHAR(80) NOT NULL,
            allocated DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_budgets_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS announcements (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            title VARCHAR(190) NOT NULL,
            body TEXT NOT NULL,
            date DATETIME NOT NULL,
            status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_announcements_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS proofs (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            date DATETIME NOT NULL,
            member_name VARCHAR(120) NOT NULL,
            member_email VARCHAR(190) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            note VARCHAR(255) NOT NULL DEFAULT '',
            file_name VARCHAR(255) NULL,
            status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_proofs_org_status (organization_id, status),
            CONSTRAINT fk_proofs_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS activities (
            id VARCHAR(64) NOT NULL PRIMARY KEY,
            organization_id BIGINT UNSIGNED NOT NULL,
            date DATETIME NOT NULL,
            actor VARCHAR(120) NOT NULL,
            action VARCHAR(190) NOT NULL,
            detail VARCHAR(500) NOT NULL DEFAULT '',
            CONSTRAINT fk_activities_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS app_metadata (
            meta_key VARCHAR(80) NOT NULL PRIMARY KEY,
            meta_value VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ];

    foreach ($statements as $statement) {
        $pdo->exec($statement);
    }

    $pdo->prepare('INSERT IGNORE INTO organizations (name) VALUES (?)')->execute(['CTU BSIT Society']);
    $organizationId = (int) $pdo->query("SELECT id FROM organizations WHERE name = 'CTU BSIT Society'")->fetchColumn();
    $seeded = $pdo->prepare('SELECT meta_value FROM app_metadata WHERE meta_key = ?');
    $seeded->execute(['default_organization_seeded']);
    if ($seeded->fetchColumn() === false) {
        campusCashSeedOrganization($pdo, $organizationId);
        $pdo->prepare('INSERT INTO app_metadata (meta_key, meta_value) VALUES (?, ?)')
            ->execute(['default_organization_seeded', '1']);
    }
}

function campusCashSeedOrganization(PDO $pdo, int $organizationId): void
{
    $members = [
        ['m-1', 'juan@email.com', 'Juan Dela Cruz', 'Treasurer'],
        ['m-2', 'ana.reyes@email.com', 'Ana Reyes', 'President'],
        ['m-3', 'miguel.s@email.com', 'Miguel Santos', 'Member'],
        ['m-4', 'maria.cruz@email.com', 'Maria Cruz', 'Member'],
        ['m-5', 'paolo.lim@email.com', 'Paolo Lim', 'Member'],
    ];
    $insertMember = $pdo->prepare("INSERT IGNORE INTO users (id, organization_id, email, full_name, member_role) VALUES (?, ?, ?, ?, ?)");
    foreach ($members as [$id, $email, $name, $role]) {
        $insertMember->execute([$id, $organizationId, $email, $name, $role]);
    }

    $transactions = [
        ['tx-1', 4, 'Campus welcome fundraiser', 'Fundraising', 'income', 12500, 'Juan Dela Cruz', 'approved', ''],
        ['tx-2', 3, 'T-shirt printing', 'Merchandise', 'expense', 1500, 'Ana Reyes', 'approved', 'shirt-printing-receipt.pdf'],
        ['tx-3', 1, 'November membership dues', 'Membership', 'contribution', 500, 'Miguel Santos', 'approved', ''],
        ['tx-4', 28, 'Tech talk venue reservation', 'Events', 'expense', 2400, 'Juan Dela Cruz', 'approved', 'venue-invoice.jpg'],
        ['tx-5', 26, 'Membership dues', 'Membership', 'contribution', 1500, 'Maria Cruz', 'approved', ''],
        ['tx-6', 22, 'Workshop materials', 'Events', 'expense', 860, 'Ana Reyes', 'approved', ''],
        ['tx-7', 19, 'Member contribution', 'Membership', 'contribution', 950, 'Paolo Lim', 'approved', ''],
        ['tx-8', 15, 'Design contest prize', 'Events', 'expense', 1200, 'Juan Dela Cruz', 'approved', 'prize-receipt.pdf'],
        ['tx-9', 11, 'Donation from alumni', 'Donation', 'income', 3200, 'Alumni Association', 'approved', ''],
        ['tx-10', 8, 'Organization dues', 'Membership', 'contribution', 1250, 'Miguel Santos', 'approved', ''],
        ['tx-11', 5, 'Intramurals banner printing reimbursement', 'Merchandise', 'expense', 750, 'Miguel Santos', 'pending', 'banner-quote.pdf'],
    ];
    $insertTransaction = $pdo->prepare('INSERT IGNORE INTO transactions (id, organization_id, date, description, category, type, amount, member_name, status, receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($transactions as [$id, $day, $description, $category, $type, $amount, $member, $status, $receipt]) {
        $insertTransaction->execute([$id, $organizationId, sprintf('2026-11-%02d 12:00:00', $day), $description, $category, $type, $amount, $member, $status, $receipt ?: null]);
    }

    $proofs = [
        ['proof-1', 'Paolo Lim', 'paolo.lim@email.com', 500, 'GCash Ref # 104928592 - Org Dues', 'gcash-receipt-500.jpg', 'Pending'],
    ];
    $insertProof = $pdo->prepare('INSERT IGNORE INTO proofs (id, organization_id, date, member_name, member_email, amount, note, file_name, status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)');
    foreach ($proofs as [$id, $name, $email, $amount, $note, $file, $status]) {
        $insertProof->execute([$id, $organizationId, $name, $email, $amount, $note, $file, $status]);
    }

    $budgets = [
        ['b-1', 'Events & workshops', 'Events', 12000],
        ['b-2', 'Merchandise', 'Merchandise', 6500],
        ['b-3', 'Operations', 'Operations', 5000],
        ['b-4', 'Outreach', 'Outreach', 3500],
    ];
    $insertBudget = $pdo->prepare('INSERT IGNORE INTO budgets (id, organization_id, name, category, allocated) VALUES (?, ?, ?, ?, ?)');
    foreach ($budgets as [$id, $name, $category, $allocated]) {
        $insertBudget->execute([$id, $organizationId, $name, $category, $allocated]);
    }

    $announcements = [
        ['a-1', 5, 'November contribution reminder', 'Monthly organization dues are due by November 15. Please submit proof of payment through the Contributions page.'],
        ['a-2', 2, 'Tech talk budget approved', 'The venue and workshop materials budget has been approved. Receipts will be shared after the event.'],
        ['a-3', 1, 'Welcome week fundraiser results', 'Thank you to everyone who supported our welcome week fundraiser. The complete transaction record is available in the financial reports.'],
    ];
    $insertAnnouncement = $pdo->prepare('INSERT IGNORE INTO announcements (id, organization_id, title, body, date, status) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($announcements as [$id, $day, $title, $body]) {
        $insertAnnouncement->execute([$id, $organizationId, $title, $body, sprintf('2026-11-%02d 12:00:00', $day), 'Published']);
    }

    $activities = [
        ['log-1', 4, 'Juan Dela Cruz', 'Recorded fundraiser income', 'Campus welcome fundraiser · ₱12,500.00'],
        ['log-2', 3, 'Juan Dela Cruz', 'Uploaded a receipt', 'T-shirt printing · shirt-printing-receipt.pdf'],
        ['log-3', 2, 'Ana Reyes', 'Published an announcement', 'Tech talk budget approved'],
    ];
    $insertActivity = $pdo->prepare('INSERT IGNORE INTO activities (id, organization_id, date, actor, action, detail) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($activities as [$id, $day, $actor, $action, $detail]) {
        $insertActivity->execute([$id, $organizationId, sprintf('2026-11-%02d 12:00:00', $day), $actor, $action, $detail]);
    }
}
