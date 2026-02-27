<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$musicDir = __DIR__ . '/../music';
$allowedExtensions = ['mp3', 'm4a', 'wav', 'ogg', 'flac'];

if (!is_dir($musicDir)) {
    echo json_encode([]);
    exit;
}

// Auto-detect base URL (accounts for subdirectory installs)
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
$basePath = ($scriptDir === '/' || $scriptDir === '\\') ? '' : $scriptDir;
$baseUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . $basePath;

$files = scandir($musicDir);
$tracks = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') {
        continue;
    }

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (in_array($ext, $allowedExtensions, true)) {
        $name = pathinfo($file, PATHINFO_FILENAME);

        // Parse "Artist - Title" format
        if (strpos($name, ' - ') !== false) {
            list($artist, $title) = explode(' - ', $name, 2);
        } else {
            $artist = '';
            $title = $name;
        }

        $tracks[] = [
            'artist' => trim($artist),
            'title'  => trim($title),
            'url'    => $baseUrl . '/music/' . rawurlencode($file)
        ];
    }
}

echo json_encode($tracks, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
