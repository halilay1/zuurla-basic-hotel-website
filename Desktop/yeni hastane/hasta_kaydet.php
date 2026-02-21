<?php
$host = "localhost";
$dbname = "largendx_hastane1";
$username = "root";
$password = "12345678";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
} catch (PDOException $e) {
    die("Veritabanı bağlantı hatası: " . $e->getMessage());
}

// Formdan gelen verileri al
$ad = $_POST['hastaAdi'];
$soyad = $_POST['hastaSoyadi'];
$tc = $_POST['tc'];
$dogum = $_POST['dogumTarihi'];
$cinsiyet = $_POST['cinsiyet'];
$kan = $_POST['kanGrubu'];
$alerji = $_POST['alerji'];
$iletisim = $_POST['iletisim'];
$adres = $_POST['adres'];

// Veritabanına ekle
$sql = "INSERT INTO patients (ad, soyad, tc, dogum_tarihi, cinsiyet, kan_grubu, alerji, iletisim, adres) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([$ad, $soyad, $tc, $dogum, $cinsiyet, $kan, $alerji, $iletisim, $adres]);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>
