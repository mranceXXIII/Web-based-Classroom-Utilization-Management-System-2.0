<?php
// Replace these credentials with your actual MySQL database credentials
            // $servername = "localhost";
            // $username = "root";
            // $password = "";
            // $dbname = "room_util_sys_db";
    require_once "config.php";

// Create a connection to MySQL
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
function saveDataToDatabase($filePath)
{
    global $conn;

    // Read the content of the uploaded file
    $content = file_get_contents($filePath);

    // Split the content by comma to get individual data entries
    $dataEntries = explode(",", $content);

    // Prepare the SQL statement
    $stmt = $conn->prepare("INSERT INTO exprimental_studentlist (Name) VALUES (?)");

    // Bind the parameter
    $stmt->bind_param("s", $data);

    // Loop through each data entry and insert it into the database
    foreach ($dataEntries as $data) {
        // Trim whitespace from the data before inserting
        $data = trim($data);
        $stmt->execute();
    }

    // Close the statement
    $stmt->close();
}

// Check if a file was uploaded
if (isset($_FILES["fileToUpload"])) {
    // Check for errors during the upload
    if ($_FILES["fileToUpload"]["error"] > 0) {
        echo "Error: " . $_FILES["fileToUpload"]["error"];
    } else {
        // Save the uploaded file to a temporary location
        $uploadedFile = $_FILES["fileToUpload"]["tmp_name"];

        // Call the function to save data to the database
        saveDataToDatabase($uploadedFile);

        echo "<script>alert('Data has been successfully saved to the experimental_list table.')
              location.href = 'studentList.php';</script>";
    }
} else {
    echo "Please upload a file.";
}

// Close the database connection
$conn->close();
?>
