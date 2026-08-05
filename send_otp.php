<?php
/**
 * 2-Step Passwordless Login - Step 1: Send OTP Script (send_otp.php)
 * Generates a 6-digit OTP code, sets a 5-minute expiration, updates MySQL database,
 * and mails the code via PHPMailer using Gmail SMTP.
 */

// Include database connection
require_once __DIR__ . '/db.php';

// PHPMailer imports
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Secure Session Initialization
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

// Support both JSON body payload and standard POST form data
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?? [];

$email = filter_var($jsonInput['email'] ?? $_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$role  = htmlspecialchars(trim($jsonInput['role'] ?? $_POST['role'] ?? 'Admin'));

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please enter a valid email address.']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Check if user exists in database
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error'   => 'This email address is not registered in our database. Please contact your system administrator.'
        ]);
        exit;
    }

    $userId   = $user['id'];
    $userName = $user['name'];

    // Generate random 6-digit numeric OTP code (e.g. 849201)
    $otpCode = sprintf("%06d", mt_rand(100000, 999999));

    // Calculate 5-minute expiration timestamp
    $expiresAt = date('Y-m-d H:i:s', time() + (5 * 60));

    // Save OTP code & expiration timestamp in database using PDO Prepared Statements
    $updateStmt = $pdo->prepare("UPDATE users SET otp_code = :otp, otp_expires_at = :expires WHERE email = :email");
    $updateStmt->execute([
        ':otp'     => $otpCode,
        ':expires' => $expiresAt,
        ':email'   => $email,
    ]);

    // Send Email via PHPMailer using Gmail SMTP
    $mail = new PHPMailer(true);

    // Gmail SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your_gmail_address@gmail.com'; // REPLACE WITH YOUR GMAIL ADDRESS
    $mail->Password   = 'your_gmail_app_password';     // REPLACE WITH YOUR GMAIL APP PASSWORD
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Sender & Recipient Config
    $mail->setFrom('your_gmail_address@gmail.com', 'DentaPlus Practice Portal');
    $mail->addAddress($email, $userName);

    // Email Body Formatting
    $mail->isHTML(true);
    $mail->Subject = "Your DentaPlus Verification Code: {$otpCode}";
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; background-color: #0f172a; padding: 24px; color: #f8fafc;'>
            <div style='max-width: 480px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155;'>
                <h2 style='color: #a855f7; margin-top: 0;'>DentaPlus Portal Verification</h2>
                <p style='color: #cbd5e1; font-size: 14px;'>Hello <strong>{$userName}</strong>,</p>
                <p style='color: #cbd5e1; font-size: 14px;'>Use the 6-digit verification code below to complete your passwordless sign-in request:</p>
                <div style='background-color: #0f172a; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #a855f7; border-radius: 12px; margin: 20px 0;'>
                    {$otpCode}
                </div>
                <p style='color: #94a3b8; font-size: 12px;'>This code is valid for <strong>5 minutes</strong>. If you did not request this login, please ignore this message.</p>
            </div>
        </div>
    ";
    $mail->AltBody = "Hello {$userName},\n\nYour DentaPlus verification code is: {$otpCode}\nThis code expires in 5 minutes.";

    // Send the email
    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Verification code sent to your email inbox.',
        'expires_in_seconds' => 300
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to send verification code. Please check SMTP configuration or try again.'
    ]);
    exit;
}
