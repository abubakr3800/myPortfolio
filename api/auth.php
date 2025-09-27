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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit();
}

$action = $input['action'];
$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// Validate input
if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit();
}

// Validate username format
if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Username can only contain letters, numbers, and underscores']);
    exit();
}

// Ensure users directory exists
$usersDir = '../data/users';
if (!file_exists($usersDir)) {
    mkdir($usersDir, 0755, true);
}

$usersFile = $usersDir . '/users.json';

// Load existing users
$users = [];
if (file_exists($usersFile)) {
    $usersData = file_get_contents($usersFile);
    $users = json_decode($usersData, true) ?: [];
}

switch ($action) {
    case 'register':
        // Check if username already exists
        if (isset($users[$username])) {
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
            exit();
        }
        
        // Validate password length
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
            exit();
        }
        
        // Create user directory
        $userDir = $usersDir . '/' . $username;
        if (!file_exists($userDir)) {
            mkdir($userDir, 0755, true);
        }
        
        // Create default portfolio data
        $defaultData = [
            'personal' => [
                'name' => '',
                'location' => '',
                'phone' => '',
                'email' => '',
                'objective' => '',
                'cv' => ''
            ],
            'education' => [
                'degree' => '',
                'institution' => '',
                'year' => ''
            ],
            'experience' => [],
            'volunteering' => [],
            'certificates' => [],
            'skills' => [
                'technical' => [],
                'teaching' => [],
                'languages' => []
            ],
            'projects' => [
                'electronics' => [],
                'web' => [],
                'trainings' => []
            ]
        ];
        
        // Save default data
        $dataFile = $userDir . '/data.json';
        file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT));
        
        // Add user to users list
        $users[$username] = [
            'password' => md5($password),
            'created_at' => date('Y-m-d H:i:s'),
            'last_login' => null
        ];
        
        // Save users data
        if (file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'Account created successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create account']);
        }
        break;
        
    case 'login':
        // Check if user exists
        if (!isset($users[$username])) {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
            exit();
        }
        
        // Verify password
        if ($users[$username]['password'] !== md5($password)) {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
            exit();
        }
        
        // Update last login
        $users[$username]['last_login'] = date('Y-m-d H:i:s');
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
        
        echo json_encode(['success' => true, 'message' => 'Login successful']);
        break;
        
    case 'changePassword':
        // Check if user exists
        if (!isset($users[$username])) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit();
        }
        
        $currentPassword = isset($input['currentPassword']) ? $input['currentPassword'] : '';
        $newPassword = isset($input['newPassword']) ? $input['newPassword'] : '';
        
        // Verify current password
        if ($users[$username]['password'] !== md5($currentPassword)) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit();
        }
        
        // Validate new password
        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
            exit();
        }
        
        // Update password
        $users[$username]['password'] = md5($newPassword);
        $users[$username]['password_changed_at'] = date('Y-m-d H:i:s');
        
        // Save users data
        if (file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to change password']);
        }
        break;
        
    case 'deleteAccount':
        // Check if user exists
        if (!isset($users[$username])) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit();
        }
        
        // Verify password
        if ($users[$username]['password'] !== md5($password)) {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
            exit();
        }
        
        // Remove user from users.json (soft delete - data remains)
        unset($users[$username]);
        
        // Save updated users data
        if (file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
            // Create a backup marker file to indicate account was deleted
            $userDir = $usersDir . '/' . $username;
            $deletedMarker = $userDir . '/.deleted_' . date('Y-m-d_H-i-s');
            file_put_contents($deletedMarker, json_encode([
                'deleted_at' => date('Y-m-d H:i:s'),
                'deleted_by' => 'user_request',
                'data_retention_days' => 30
            ], JSON_PRETTY_PRINT));
            
            echo json_encode(['success' => true, 'message' => 'Account deleted successfully. Your data will be kept for 30 days for potential recovery.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete account']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>
