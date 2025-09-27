<?php
header('Content-Type: application/json');
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get POST data
$name    = $_POST['name']    ?? '';
$email   = $_POST['email']   ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

if (!$name || !$email || !$subject || !$message) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'guide.me.create@gmail.com'; // Your email address
    $mail->Password   = 'quznzeupzxisvmol';    // App password (not your Gmail password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('guide.me.create@gmail.com', 'Your Name');
    $mail->addAddress('ahmed.mo.abubakr@gmail.com', 'Recipient Name'); // Add a recipient
    $mail->addAddress($email, 'Recipient Name'); // Add a recipient

    $mail->isHTML(true);
    $mail->Subject = "Portfolio Contact: " . $subject;
    $mail->Body    = '<div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;background:#f9f9f9;padding:24px;border-radius:12px;border:1px solid #e0e0e0;">
    <h2 style="color:#2a4365;margin-top:0;">New Contact Message</h2>
    <table style="width:100%;margin-bottom:18px;">
      <tr>
        <td style="font-weight:bold;padding:6px 0;width:90px;">Name:</td>
        <td style="padding:6px 0;">'.htmlspecialchars($name).'</td>
      </tr>
      <tr>
        <td style="font-weight:bold;padding:6px 0;">Email:</td>
        <td style="padding:6px 0;"><a href="mailto:'.htmlspecialchars($email).'" style="color:#3182ce;text-decoration:none;">'.htmlspecialchars($email).'</a></td>
      </tr>
      <tr>
        <td style="font-weight:bold;padding:6px 0;">Subject:</td>
        <td style="padding:6px 0;">'.htmlspecialchars($subject).'</td>
      </tr>
    </table>
    <div style="background:#fff;border-radius:8px;padding:16px;border:1px solid #e2e8f0;">
      <div style="font-weight:bold;color:#2a4365;margin-bottom:8px;">Message:</div>
      <div style="color:#2d3748;line-height:1.6;">'.nl2br(htmlspecialchars($message)).'</div>
    </div>
    <div style="margin-top:24px;font-size:13px;color:#718096;text-align:center;">
      This message was sent from your portfolio contact form.
    </div>
  </div>' ;

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
}
