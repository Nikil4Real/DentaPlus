<?php
/**
 * Secure PHP Login Script (login.php)
 * Fetches user by email using PDO prepared statements and verifies password using password_verify().
 */

require_once __DIR__ . '/db.php';

// Secure Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => 86400,
        'cookie_httponly' => true,      // Prevent XSS access to session cookie
        'cookie_samesite' => 'Lax',     // CSRF protection
        'cookie_secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    ]);
}

header('Content-Type: application/json; charset=utf-8');

// Ensure request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Extract and sanitize input parameters
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$password = $_POST['password'] ?? '';
$csrfToken = $_POST['csrf_token'] ?? '';

// Validate inputs
if (!$email || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please provide a valid email and password.']);
    exit;
}

// CSRF Token Validation (if token exists in session)
if (isset($_SESSION['csrf_token']) && !hash_equals($_SESSION['csrf_token'], $csrfToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid security token (CSRF mismatch).']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Prepared Statement to prevent SQL Injection
    $stmt = $pdo->prepare("SELECT id, name, email, password, role, is_active FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Verify Password using password_verify()
    if ($user && password_verify($password, $user['password'])) {
        
        // Check if account is active
        if (isset($user['is_active']) && !$user['is_active']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Your account is deactivated. Please contact support.']);
            exit;
        }

        // Prevent Session Fixation
        session_regenerate_id(true);

        // Store authenticated user state in Session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'] ?? 'user';
        $_SESSION['logged_in'] = true;

        // Check if password hash needs to be updated to a stronger algorithm/cost
        if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
            $updateStmt->execute([':password' => $newHash, ':id' => $user['id']]);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'] ?? 'user',
            ]
        ]);
        exit;

    } else {
        // Generic error message to prevent User Enumeration attack
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An internal server error occurred.']);
    exit;
}
