<?php
                                        // to be honest di ini sya included
// Include the header
include_once("header.php");
include_once("navbar.php");

// Database connection details
    // $hostname = "localhost";
    // $username = "root";
    // $password = "";
    // $databaseName = "insertion";

require_once "config.php";

// Connect to the database
$connect = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
if (!$connect) {
    die("Connection failed: " . mysqli_connect_error());
}

// Delete record
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = mysqli_real_escape_string($connect, $_POST['id']);
    $sql = "DELETE FROM data WHERE id='$id'";
    if (mysqli_query($connect, $sql)) {
        echo '<script type="text/javascript">
            alert("Schedule Successfully Deleted");
            location="tb.php";
        </script>';
    } else {
        echo "Error deleting record: " . mysqli_error($connect);
    }
}

// Fetch records from the 'data' table
$query = "SELECT * FROM data";
$result = mysqli_query($connect, $query);

// Include the footer
include_once("footer.php");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Schedules</title>
    <style>
        body {
            background-image: url();
            background-color: white;
        }
        tr:hover, tr.alt:hover {
            background: #f7dcdf;
        }
    </style>
</head>
<body>
    <div id="content">
        <div id="form">
            <fieldset>
                <legend>Schedules</legend>
                <table class='table' width='99.120%' border='0'>
                    <tr class='table'>
                        <th>name</th>
                        <th>course</th>
                        <th>subject</th>
                        <th>room</th>
                        <th>start time</th>
                        <th>end time</th>
                        <th>action</th>
                    </tr>
                    <?php
                    while ($row = mysqli_fetch_array($result)) {
                        echo "<tr>";
                        echo "<td>" . $row['name'] . "</td>";
                        echo "<td>" . $row['subject'] . "</td>";
                        echo "<td>" . $row['room'] . "</td>";
                        echo "<td>" . $row['weekDays'] . "</td>";
                        echo "<td>" . $row['startTime'] . "</td>";
                        echo "<td>" . $row['endTime'] . "</td>";
                        echo "<td>
                            <form method='post' action='tb.php'>
                                <input name='id' type='hidden' value='" . $row['id'] . "'>
                                <input type='submit' name='submit' value='Delete'>
                            </form>
                        </td>";
                        echo "</tr>";
                    }
                    ?>
                </table>
            </fieldset>
        </div>
    </div>
    <div align="center">
        <br>
        <a href="Insertion.php"><input type='submit' class='' name='delete' value='New'></a>
        <a href="Index.php"><input type='submit' class='' name='delete' value='Logout'></a>
    </div>
</body>
</html>
