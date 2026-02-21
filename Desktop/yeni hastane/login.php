<?php
header('Content-Type: application/json');
session_start();

// MySQL bağlantısı
$pdo = new PDO("mysql:host=localhost;dbname=largendx_hastane1;charset=utf8", "root", "12345678"); // Şifre varsa buraya ekle
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// JSON veriyi al
$data = json_decode(file_get_contents("php://input"), true);
$username = $data[''];
$password = $data[''];

// Kullanıcıyı kontrol et
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? AND password_hash = SHA2(?, 256)");
$stmt->execute([$username, $password]);
$user = $stmt->fetch();

if ($user) {
    $_SESSION['admin'] = $user['username'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
