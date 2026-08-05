<?php
/**
 * 2-Step Passwordless Login - Step 2: Verify OTP Script (verify_otp.php)
 * Validates email and 6-digit OTP code against MySQL database, enforces 5-minute expiration,
 * clears used OTP, regenerates session, and logs user into dashboard.
 */

require_once __DIR__ . '/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => 86400,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
        'cookie_secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    ]);
}

header('Content-Type: application/json; charset=utf-8');

// Ensure Request Method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read input payload (Supports JSON and Form Data)
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?? [];

$email   = filter_var($jsonInput['email'] ?? $_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$otpCode = trim($jsonInput['otp_code'] ?? $_POST['otp_code'] ?? '');

if (!$email || empty($otpCode)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please enter both your email address and 6-digit verification code.']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Query user record using PDO Prepared Statement
    $stmt = $pdo->prepare("
        SELECT id, name, email, role, otp_code, otp_expires_at 
        FROM users 
        WHERE email = :email 
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired verification code.']);
        exit;
    }

    // Check if OTP matches and expiration timestamp NOW() < otp_expires_at
    $currentTime = time();
    $expirationTime = !empty($user['otp_expires_at']) ? strtotime($user['otp_expires_at']) : 0;

    if (empty($user['otp_code']) || $user['otp_code'] !== $otpCode || $currentTime > $expirationTime) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired verification code.']);
        exit;
    }

    // OTP is valid! Clear the used OTP code & expiration timestamp
    $clearStmt = $pdo->prepare("UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = :id");
    $clearStmt->execute([':id' => $user['id']]);

    // Prevent Session Fixation Attack
    session_regenerate_id(true);

    // Set Session Variables
    $_SESSION['logged_in']  = true;
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role']  = $user['role'] ?? 'Admin';

    echo json_encode([
        'success'      => true,
        'message'      => 'Verification successful! Redirecting to dashboard...',
        'redirect_url' => 'dashboard.php',
        'user'         => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'] ?? 'Admin'
        ]
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An internal server error occurred while verifying OTP.']);
    exit;
}
