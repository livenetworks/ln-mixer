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

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($musicDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

$tracks = [];

foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDir()) {
        continue;
    }

    $ext = strtolower($fileInfo->getExtension());

    if (in_array($ext, $allowedExtensions, true)) {
        $name = $fileInfo->getBasename('.' . $fileInfo->getExtension());

        // Parse "Artist - Title" format
        if (strpos($name, ' - ') !== false) {
            list($artist, $title) = explode(' - ', $name, 2);
        } else {
            $artist = '';
            $title = $name;
        }

        // Relative path from music dir for URL
        $relativePath = str_replace('\\', '/', substr($fileInfo->getPathname(), strlen($musicDir) + 1));
        $urlParts = array_map('rawurlencode', explode('/', $relativePath));

        $tracks[] = [
            'artist' => trim($artist),
            'title'  => trim($title),
            'url'    => $baseUrl . '/music/' . implode('/', $urlParts)
        ];
    }
}

echo json_encode($tracks, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
