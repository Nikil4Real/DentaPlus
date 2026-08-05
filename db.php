<?php
/**
 * Database Connection Setup (db.php)
 * Uses PDO for secure, prepared SQL execution against MySQL.
 */

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: 'dentaplus_db');
define('DB_USER', getenv('DB_USER') ?: 'db_user');
define('DB_PASS', getenv('DB_PASS') ?: 'secure_password_here');
define('DB_CHARSET', 'utf8mb4');

function getDbConnection(): PDO {
    $dsn = sprintf("mysql:host=%s;dbname=%s;charset=%s", DB_HOST, DB_NAME, DB_CHARSET);
    
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // Native prepared statements
    ];

    try {
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        error_log("Database Connection Failure: " . $e->getMessage());
        throw new Exception("Unable to connect to the database. Please try again later.");
    }
}
