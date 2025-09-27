<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Check if files were uploaded
if (!isset($_FILES['files']) || empty($_FILES['files']['name'][0])) {
    echo json_encode(['success' => false, 'message' => 'No files uploaded']);
    exit();
}

// Log for debugging
error_log("Upload request - Files: " . print_r($_FILES, true));
error_log("Upload request - POST: " . print_r($_POST, true));

$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$type = isset($_POST['type']) ? trim($_POST['type']) : '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Username is required']);
    exit();
}

if (empty($type)) {
    echo json_encode(['success' => false, 'message' => 'File type is required']);
    exit();
}

// Validate username format
if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Invalid username format']);
    exit();
}

// Validate file type
if (!in_array($type, ['images', 'documents'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit();
}

// Ensure user directory exists
$userDir = '../data/users/' . $username;
if (!file_exists($userDir)) {
    mkdir($userDir, 0755, true);
}

// Create upload directory based on type
$uploadDir = $userDir . '/' . $type;
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$uploadedFiles = [];
$errors = [];

// Define allowed file types
$allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

$allowedTypes = $type === 'images' ? $allowedImageTypes : $allowedDocumentTypes;
$maxFileSize = 10 * 1024 * 1024; // 10MB

// Process uploaded files
$files = $_FILES['files'];
$fileCount = count($files['name']);

for ($i = 0; $i < $fileCount; $i++) {
    $fileName = $files['name'][$i];
    $fileTmpName = $files['tmp_name'][$i];
    $fileSize = $files['size'][$i];
    $fileType = $files['type'][$i];
    $fileError = $files['error'][$i];

    // Check for upload errors
    if ($fileError !== UPLOAD_ERR_OK) {
        $errors[] = "Error uploading $fileName: " . getUploadErrorMessage($fileError);
        continue;
    }

    // Check file size
    if ($fileSize > $maxFileSize) {
        $errors[] = "File $fileName is too large (max 10MB)";
        continue;
    }

    // Check file type
    if (!in_array($fileType, $allowedTypes)) {
        $errors[] = "File $fileName has invalid type";
        continue;
    }

    // Generate unique filename
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $uniqueFileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
    
    // Ensure unique filename
    $counter = 1;
    $originalFileName = $uniqueFileName;
    while (file_exists($uploadDir . '/' . $uniqueFileName)) {
        $pathInfo = pathinfo($originalFileName);
        $uniqueFileName = $pathInfo['filename'] . '_' . $counter . '.' . $pathInfo['extension'];
        $counter++;
    }

    $uploadPath = $uploadDir . '/' . $uniqueFileName;

    // Move uploaded file
    if (move_uploaded_file($fileTmpName, $uploadPath)) {
        $uploadedFiles[] = [
            'original_name' => $fileName,
            'saved_name' => $uniqueFileName,
            'path' => 'data/users/' . $username . '/' . $type . '/' . $uniqueFileName,
            'size' => $fileSize,
            'type' => $fileType
        ];
    } else {
        $errors[] = "Failed to save file $fileName";
    }
}

// Prepare response
$response = [
    'success' => count($uploadedFiles) > 0,
    'uploaded' => count($uploadedFiles),
    'total' => $fileCount,
    'files' => $uploadedFiles
];

if (!empty($errors)) {
    $response['errors'] = $errors;
    $response['message'] = 'Some files failed to upload';
} else {
    $response['message'] = 'All files uploaded successfully';
}

echo json_encode($response);

function getUploadErrorMessage($errorCode) {
    switch ($errorCode) {
        case UPLOAD_ERR_INI_SIZE:
            return 'File exceeds upload_max_filesize directive';
        case UPLOAD_ERR_FORM_SIZE:
            return 'File exceeds MAX_FILE_SIZE directive';
        case UPLOAD_ERR_PARTIAL:
            return 'File was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'File upload stopped by extension';
        default:
            return 'Unknown upload error';
    }
}
?>
