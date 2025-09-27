<?php
// Turn off error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and action
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$action = '';
$input = null;

// For GET requests, get action from URL parameters
if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
} else if ($method === 'POST') {
    // First try to get from JSON body
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $input = json_decode($rawInput, true);
        if ($input && isset($input['action'])) {
            $action = $input['action'];
        }
    }
    // Fallback to POST data
    if (empty($action)) {
        $action = isset($_POST['action']) ? $_POST['action'] : '';
    }
    
}

// Log for debugging
error_log("Data API - Method: " . $method);
error_log("Data API - Action: " . $action);
error_log("Data API - Input: " . print_r($input, true));

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

try {
    switch ($action) {
        case 'get':
            handleGetData();
            break;
        case 'save':
            handleSaveData($input);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}

function handleGetData() {
    if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'GET') {
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

    $userDir = '../data/users/' . $username;
    $dataFile = $userDir . '/data.json';

    if (!file_exists($dataFile)) {
        // Return default data structure
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
        
        echo json_encode(['success' => true, 'data' => $defaultData]);
        exit();
    }

    $data = file_get_contents($dataFile);
    $jsonData = json_decode($data, true);

    if ($jsonData === null) {
        echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        exit();
    }

    echo json_encode(['success' => true, 'data' => $jsonData]);
}

function handleSaveData($input) {
    try {
        if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit();
        }

        // Log for debugging
        error_log("Save data request - Action: " . $action);
        error_log("Save data request - Parsed input: " . print_r($input, true));

        if (!$input) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit();
        }
    } catch (Exception $e) {
        error_log("handleSaveData Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error in handleSaveData: ' . $e->getMessage()]);
        exit();
    }

    $username = isset($input['username']) ? trim($input['username']) : '';
    $data = isset($input['data']) ? $input['data'] : null;

    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username is required']);
        exit();
    }

    if ($data === null) {
        echo json_encode(['success' => false, 'message' => 'Data is required']);
        exit();
    }

    // Validate username format
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        echo json_encode(['success' => false, 'message' => 'Invalid username format']);
        exit();
    }

    // Validate data structure
    $requiredFields = ['personal', 'education', 'experience', 'volunteering', 'skills', 'projects', 'certificates'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit();
        }
    }

    // Ensure user directory exists
    $userDir = '../data/users/' . $username;
    if (!file_exists($userDir)) {
        mkdir($userDir, 0755, true);
    }

    $dataFile = $userDir . '/data.json';

    // Validate JSON data
    $jsonString = json_encode($data, JSON_PRETTY_PRINT);
    if ($jsonString === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid data format']);
        exit();
    }

    // Save data
    error_log("Attempting to save data to: " . $dataFile);
    error_log("Data to save: " . $jsonString);
    
    if (file_put_contents($dataFile, $jsonString)) {
        error_log("Data saved successfully");
        echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
    } else {
        error_log("Failed to save data - file_put_contents returned false");
        echo json_encode(['success' => false, 'message' => 'Failed to save data']);
    }
}
?>
