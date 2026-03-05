<?php
session_start();

if(isset($_SESSION['username'])) {
    // User is logged in
    $username = $_SESSION['username'];

    // Connect to MySQL database
            // $servername = "localhost";
            // $dbUsername = "root";
            // $dbPassword = "";
            // $dbName = "room_util_sys_db";
    require_once "config.php";

    $conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    // Update the timestamp for the logged-in user in the database
    $query = "UPDATE it_faculty SET `timestamp` = NOW() WHERE `Name` = '$username'";
    $result = mysqli_query($conn, $query);

    if ($result) {
        // Timestamp updated successfully
        echo "<script>console.log('Timestamp updated.')</script>";
    } else {
        // Error updating the timestamp
        echo "Error updating timestamp: " . mysqli_error($conn);
    }

    // Close the database connection
    mysqli_close($conn);
} else {
    // 
    echo "<script>console.log('User is not logged in.')</script>";
}
?>
