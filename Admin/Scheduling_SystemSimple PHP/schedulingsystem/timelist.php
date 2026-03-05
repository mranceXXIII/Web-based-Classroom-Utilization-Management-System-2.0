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
<div class="container"><br>
<legend><h3>First Semester Schedule</h3></legend>
    <body>
    <?php
    echo "<tr>
            <td>";
    // your database connection
    // $host = "localhost";
    // $username = "root";
    // $password = "";
    // $database = "room_util_sys_db";
    require_once "config.php";

    // select database
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        die("Couldn't connect to the database: " . $conn->connect_error);
    }

    // modified area for multiple tables from monday to sunday


    function createScheduleTable($day, $conn,$seM) {
        $queryCount = "SELECT COUNT(*) AS result_count FROM table_sched WHERE $day = 'green' AND Semester = ?";
        $stmtCount = $conn->prepare($queryCount);
        $stmtCount->bind_param("s", $seM);
        $stmtCount->execute();
        $resultCount = $stmtCount->get_result();
        $rowCount = $resultCount->fetch_assoc();
        $totalResults = $rowCount['result_count'];

        $query = "SELECT * FROM table_sched WHERE $day = 'green' AND Semester = ? ORDER BY Start_Time;";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $seM);
        $stmt->execute();
        $result = $stmt->get_result();
    
        echo "<button class='btn btn-primary convert-button'data-table-id='$day--$seM' style='float:left;'>Convert Table to CSV</button>";
    
        echo "<div class='container'><table width='' id='$day--$seM' class='table table-bordered' border='1'><thead>
                <tr><th colspan=\"5\" style=\"background-color: #008000; color: white;\">$day ($totalResults)</th></tr>
                <tr>
                    <th style=\"background-color: Yellow;\">Room</th>
                    <th style=\"background-color: lightblue;\">Blocks</th>
                    <th style=\"background-color: lightblue;\">Faculty</th>
                    <th style=\"background-color: #7BCCB5;\">Start time</th>
                    <th style=\"background-color: #FFB4B4;\">End time</th>
                </tr></thead><tbody>";


    
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            // echo "<td>" . $row[$day] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['room'] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['blocks'] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['faculty'] . "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['Start_Time'])) . "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['End_Time'])) . "</td>";
            echo "</tr>";
        }
        echo "</tbody></table></div>";
    }
    
    // for the creation of table from Monday to sunday

  function semListSched($conn,$seM){
    $days = array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

    foreach ($days as $day) {
        createScheduleTable($day, $conn,$seM);
    }

  }




  semListSched($conn,'1st Sem');
 



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


<div class="container"><br>
<legend style="text-align: center;"><h3>Second Semester Schedule</h3></legend>

<?php
semListSched($conn,'2nd Sem');
 
?>

</fieldset>
    </form>
</div>
</div>
</div>
</div>
<script>
//     document.querySelectorAll(".convert-button").forEach(function(button, index) {
//   button.addEventListener("click", function() {
//     const tables = document.querySelectorAll(".table");
//     const table = tables[index]; // Get the table corresponding to the button's index

//     let csv = "";

//     for (let i = 0; i < table.rows.length; i++) {
//       const row = table.rows[i];
//       const rowData = [];

//       for (let j = 0; j < row.cells.length; j++) {
//         const cell = row.cells[j];
//         const cellData = cell.textContent;
//         rowData.push(`"${cellData}"`);
//       }

//       csv += rowData.join(",") + "\n";
//     }

//     const blob = new Blob([csv], { type: "text/csv" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `Whole_Day_Schedule_${index + 1}_data.csv`;
//     link.click();
//   });
// });
</script>
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