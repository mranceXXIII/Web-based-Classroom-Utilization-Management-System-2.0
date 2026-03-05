<?php
require_once __DIR__ . '/vendor/autoload.php'; // Include Composer's autoloader

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $htmlContent = $_POST['htmlContent'];

    // Create an instance of mPDF
    $mpdf = new \Mpdf\Mpdf();

    // Write HTML content to the PDF
    $mpdf->WriteHTML($htmlContent);

    // Output the PDF for download
    $mpdf->Output('converted-page.pdf', 'D');
}
?>
