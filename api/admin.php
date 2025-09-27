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

$usersFile = $usersDir . '/users.json';

switch ($action) {
    case 'getUsers':
        handleGetUsers();
        break;
    case 'getUser':
        handleGetUser();
        break;
    case 'deleteUser':
        handleDeleteUser();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleGetUsers() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit();
    }

    $users = [];
    $usersData = [];

    // Load users list
    if (file_exists($usersFile)) {
        $usersData = file_get_contents($usersFile);
        $users = json_decode($usersData, true) ?: [];
    }

    $usersWithData = [];

    foreach ($users as $username => $userInfo) {
        $userDir = $usersDir . '/' . $username;
        $dataFile = $userDir . '/data.json';
        
        $userData = null;
        if (file_exists($dataFile)) {
            $data = file_get_contents($dataFile);
            $userData = json_decode($data, true);
        }

        $usersWithData[] = [
            'username' => $username,
            'created_at' => $userInfo['created_at'],
            'last_login' => $userInfo['last_login'],
            'personal' => $userData['personal'] ?? null,
            'education' => $userData['education'] ?? null,
            'experience' => $userData['experience'] ?? null,
            'volunteering' => $userData['volunteering'] ?? null,
            'skills' => $userData['skills'] ?? null,
            'projects' => $userData['projects'] ?? null,
            'certificates' => $userData['certificates'] ?? null
        ];
    }

    echo json_encode(['success' => true, 'users' => $usersWithData]);
}

function handleGetUser() {
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

    // Load user info
    $users = [];
    if (file_exists($usersFile)) {
        $usersData = file_get_contents($usersFile);
        $users = json_decode($usersData, true) ?: [];
    }

    if (!isset($users[$username])) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }

    // Load user data
    $userDir = $usersDir . '/' . $username;
    $dataFile = $userDir . '/data.json';
    
    $userData = null;
    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        $userData = json_decode($data, true);
    }

    $user = [
        'username' => $username,
        'created_at' => $users[$username]['created_at'],
        'last_login' => $users[$username]['last_login'],
        'personal' => $userData['personal'] ?? null,
        'education' => $userData['education'] ?? null,
        'experience' => $userData['experience'] ?? null,
        'volunteering' => $userData['volunteering'] ?? null,
        'skills' => $userData['skills'] ?? null,
        'projects' => $userData['projects'] ?? null,
        'certificates' => $userData['certificates'] ?? null
    ];

    echo json_encode(['success' => true, 'user' => $user]);
}

function handleDeleteUser() {
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

    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username is required']);
        exit();
    }

    // Validate username format
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Invalid username format']);
        exit();
    }

    // Load users list
    $users = [];
    if (file_exists($usersFile)) {
        $usersData = file_get_contents($usersFile);
        $users = json_decode($usersData, true) ?: [];
    }

    if (!isset($users[$username])) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }

    // Remove user from users list
    unset($users[$username]);
    
    // Save updated users list
    if (!file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => false, 'message' => 'Failed to update users list']);
        exit();
    }

    // Remove user directory and all files
    $userDir = $usersDir . '/' . $username;
    if (file_exists($userDir)) {
        if (!deleteDirectory($userDir)) {
            echo json_encode(['success' => false, 'message' => 'Failed to delete user files']);
            exit();
        }
    }

    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
}

function deleteDirectory($dir) {
    if (!is_dir($dir)) {
        return false;
    }

    $files = array_diff(scandir($dir), array('.', '..'));
    
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        if (is_dir($path)) {
            deleteDirectory($path);
        } else {
            unlink($path);
        }
    }
    
    return rmdir($dir);
}
?>
