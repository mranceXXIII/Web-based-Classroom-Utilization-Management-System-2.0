<?php
// define('DB_SERVER', 'localhost');
// define('DB_USERNAME', 'root');
// define('DB_PASSWORD', '');
// define('DB_NAME', 'room_util_sys_db');

require_once "config.php";
/* Attempt to connect to MySQL database */

$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
// $link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

$name = "";
$id ="";

if(isset($_GET["id"]) && !empty($_GET["id"])) {
    // Retrieve the id value from the URL
    $id = $_GET["id"];

    // Process the id value as needed
    //echo "ID to update: " . $id;
} else {
    // Handle the case when the id parameter is missing or empty
    echo "No ID parameter found";
}

// Check if form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate and sanitize the submitted faculty name
    $facultyName = $_POST["name"];

    // Update the faculty name in the database
    $sql = "UPDATE table_sched SET faculty = ? WHERE id = ?";
    $stmt = mysqli_prepare($link, $sql);
    mysqli_stmt_bind_param($stmt, "si", $facultyName, $id);
    if(mysqli_stmt_execute($stmt)) {
        echo "Faculty name updated successfully.";
        header('Location: tablelist.php'); // Redirect to tablelist.php
        exit(); // Stop further execution
    } else {
        echo "Error updating faculty name: " . mysqli_error($link);
    }
    mysqli_stmt_close($stmt);
}



?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Faculty</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            box-sizing: border-box;
        }

        .form-container {
            max-width: 300px;
            width: 100%;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-weight: bold;
        }

        select, input[type="submit"] {
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
        }

        input[type="submit"] {
            background-color: #4CAF50;
            color: white;
            cursor: pointer;
        }

        input[type="submit"]:hover {
            background-color: #45a049;
        }

        .back-link {
            display: block;
            margin-top: 10px;
            text-align: center;
            text-decoration: none;
            color: #555;
        }

        .back-link:hover {
            color: #000;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <form action="" method="POST">

            <div class="form-group">
                <label for="name">Update Faculty Name</label><br>
                <select name="name" id="name">
                    <option value="None">None</option>
                    <?php           
                    if(isset($_GET["id"]) && !empty($_GET["id"])) {
                        // Retrieve the id value from the URL
                        $id = $_GET["id"];

                        // Step 1: Connect to the MySQL database
                        $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                        if (!$connection) {
                            die('Connection failed: ' . mysqli_connect_error());
                        }

                        // Retrieve the faculty names from the table
                        $query = "SELECT Name FROM it_faculty ORDER BY Name";
                        $result = mysqli_query($connection, $query);
                        if (!$result) {
                            die('Query failed: ' . mysqli_error($connection));
                        }

                        // Generate the options for the dropdown list
                        while ($row = mysqli_fetch_assoc($result)) {
                            $selected = ($id == $row['id']) ? 'selected' : '';
                            echo '<option value="' . $row['Name'] . '" ' . $selected . '>' . $row['Name'] . '</option>';
                        }

                        // Close the database connection
                        mysqli_close($connection);
                    }
                    ?>
                </select>
            </div>

            <input type="hidden" name="id" value="<?php echo $id; ?>"/>
            <input type="submit" value="Update Faculty">
            <a href="tablelist.php" class="back-link">Back</a>
        </form>
    </div>

</body>
</html>
