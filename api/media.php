<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Validate action
if (empty($action)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Action parameter is required']);
    exit();
}

// Ensure users directory exists
$usersDir = '../data/users';
if (!file_exists($usersDir)) {
    mkdir($usersDir, 0755, true);
}

switch ($action) {
    case 'getFiles':
        handleGetFiles();
        break;
    case 'deleteFile':
        handleDeleteFile();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleGetFiles() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit();
    }

    $username = isset($_GET['username']) ? trim($_GET['username']) : '';
    
    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username is required']);
        exit();
    }

    // Validate username format
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Invalid username format']);
        exit();
    }

    $userDir = $usersDir . '/' . $username;
    $files = [];

    // Check for images directory
    $imagesDir = $userDir . '/images';
    if (file_exists($imagesDir)) {
        $imageFiles = scandir($imagesDir);
        foreach ($imageFiles as $file) {
            if ($file !== '.' && $file !== '..' && !is_dir($imagesDir . '/' . $file)) {
                $filePath = $imagesDir . '/' . $file;
                $files[] = [
                    'name' => $file,
                    'original_name' => $file,
                    'category' => 'images',
                    'type' => mime_content_type($filePath),
                    'size' => filesize($filePath),
                    'uploaded_at' => date('Y-m-d H:i:s', filemtime($filePath))
                ];
            }
        }
    }

    // Check for documents directory
    $documentsDir = $userDir . '/documents';
    if (file_exists($documentsDir)) {
        $documentFiles = scandir($documentsDir);
        foreach ($documentFiles as $file) {
            if ($file !== '.' && $file !== '..' && !is_dir($documentsDir . '/' . $file)) {
                $filePath = $documentsDir . '/' . $file;
                $files[] = [
                    'name' => $file,
                    'original_name' => $file,
                    'category' => 'documents',
                    'type' => mime_content_type($filePath),
                    'size' => filesize($filePath),
                    'uploaded_at' => date('Y-m-d H:i:s', filemtime($filePath))
                ];
            }
        }
    }

    // Sort files by upload date (newest first)
    usort($files, function($a, $b) {
        return strtotime($b['uploaded_at']) - strtotime($a['uploaded_at']);
    });

    echo json_encode(['success' => true, 'files' => $files]);
}

function handleDeleteFile() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit();
    }

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit();
    }

    $username = isset($input['username']) ? trim($input['username']) : '';
    $fileName = isset($input['fileName']) ? trim($input['fileName']) : '';
    $category = isset($input['category']) ? trim($input['category']) : '';

    if (empty($username) || empty($fileName) || empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Username, fileName, and category are required']);
        exit();
    }

    // Validate username format
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Invalid username format']);
        exit();
    }

    // Validate category
    if (!in_array($category, ['images', 'documents'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid category']);
        exit();
    }

    $userDir = $usersDir . '/' . $username;
    $filePath = $userDir . '/' . $category . '/' . $fileName;

    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit();
    }

    if (unlink($filePath)) {
        echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete file']);
    }
}
?>
