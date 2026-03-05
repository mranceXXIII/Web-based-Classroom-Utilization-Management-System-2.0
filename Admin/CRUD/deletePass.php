<?php
// Check if the "id" parameter is set and not empty
if(isset($_POST["id"]) && !empty($_POST["id"])) {
    deletePassword($_POST["id"]);
}

// Function to delete password
function deletePassword($id) {
    // Perform the database operation to delete the password value
   require_once "config.php";

    // Create a new database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Check the connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare and execute the SQL query to delete the password value
    $sql = "UPDATE it_faculty SET password = '' WHERE id = '$id'";
    if ($conn->query($sql) === TRUE) {
        //echo "Password deleted successfully.";
        echo "<script>window.location.href = 'index.php?success=1';</script>";
    } else {
        echo "Error deleting password: " . $conn->error;
    }

    // Close the database connection
    $conn->close();
}

?>