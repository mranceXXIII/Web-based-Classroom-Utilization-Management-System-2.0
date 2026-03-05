<?php
include_once("header.php");
include_once("navbar.php");
?>

<html>
<head>
<style>
body {
    background-image: url();
    background-color: white;
}
th {
    text-align: center;
}
tr {
     height: 30px;
}
td {
    padding-top: 5px;
    padding-left: 20px; 
    padding-bottom: 5px;    
    height: 20px;
}
</style>
</head>

<body><br>
<div class="container">
    <body>
    <?php
    echo "<tr>
            <td>";
    // your database connection
    $host = "localhost";
    $username = "root";
    $password = "";
    $database = "room_util_sys_db";

    // select database
    $conn = new mysqli($host, $username, $password, $database);
    if ($conn->connect_error) {
        die("Couldn't connect to the database: " . $conn->connect_error);
    }

    // modified area for multiple tables from monday to sunday


    function createScheduleTable($day, $conn) {
        $query = "SELECT * FROM table_sched WHERE $day = 'green';";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
    
        echo "<div class='container'><table width='' class='table table-bordered' border='1'>
                <tr><th colspan=\"4\" style=\"background-color: #008000; color: white;\">$day</th></tr>
                <tr>
                    <th style=\"background-color: Yellow;\">Room</th>
                    <th style=\"background-color: lightblue;\">Blocks</th>
                    <th style=\"background-color: #7BCCB5;\">Start time</th>
                    <th style=\"background-color: #FFB4B4;\">End time</th>
                </tr>";


    
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            // echo "<td>" . $row[$day] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['room'] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['blocks'] . "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['Start_Time'])) . "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['End_Time'])) . "</td>";
            echo "</tr>";
        }
        echo "</table></div>";
    }
    
    // for the creation of table from Monday to sunday

    $days = array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

        foreach ($days as $day) {
            createScheduleTable($day, $conn);
        }


    // end of modified area
    // delete record// di na sya applicable kay sa table_sched na mismo ga buoy ng data
                                // if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
                                //     $id = $_POST['id'];
                                //     $deleteQuery = "DELETE FROM timer WHERE id = ?";
                                //     $stmt = $conn->prepare($deleteQuery);
                                //     $stmt->bind_param("i", $id);
                                //     if ($stmt->execute()) {
                                //         echo '<script type="text/javascript">
                                //                 alert("Row Successfully Deleted");
                                //                 location="tablelist.php";
                                //               </script>';
                                //         exit;
                                //     } else {
                                //         echo 'Could not delete row: ' . $conn->error;
                                // //      }
                                //       }
    ?>
    </fieldset>
    </form>
</div>
</div>
</div>
</div>
</body>
</html>

<?php
include_once("footer.php");
?>



<!-- 
// echo "<td>
        //         <form class='form-horizontal' method='post' action='timelist.php'>
        //             <input name='id' type='hidden' value='" . $row['id'] . "'>
        //             <input type='submit' class='btn btn-danger' name='delete' value='Delete'>
        //         </form>
        //     </td>"; -->