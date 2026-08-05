<?php
/**
 * Protected Dashboard Page (dashboard.php)
 * Verifies authenticated session before serving content.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => 86400,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
        'cookie_secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    ]);
}

// Redirect to login if user is not authenticated
if (empty($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$userName = htmlspecialchars($_SESSION['user_name'] ?? 'User');
$userRole = htmlspecialchars($_SESSION['user_role'] ?? 'Staff');
$userEmail = htmlspecialchars($_SESSION['user_email'] ?? '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DentaPlus Dashboard</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .card {
            background-color: #1e293b;
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid #334155;
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .badge {
            background-color: #7c3aed;
            color: #ffffff;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Welcome, <?php echo $userName; ?>!</h2>
        <p><span class="badge"><?php echo $userRole; ?></span></p>
        <p style="color: #94a3b8; font-size: 0.875rem;"><?php echo $userEmail; ?></p>
        <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #cbd5e1;">You have successfully logged in using 2-Step Passwordless OTP.</p>
    </div>
</body>
</html>
