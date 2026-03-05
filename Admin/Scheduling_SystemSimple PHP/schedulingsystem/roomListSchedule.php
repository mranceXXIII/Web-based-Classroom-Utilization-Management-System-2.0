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

td{
            position: relative;
            /* margin: 0;
            padding: 0;
            font-size: 80%; */
            
         }

.editFacName{
            position:absolute;
            top: 0;
            right: 0;
        }
</style>
</head>

<body><br>
<div class="container">

<div class="container-fluid table" style="position: sticky; top: 2px; z-index: 10;">
        <div class="row">
            <div class="col-md-12">
                <div class="search-wrapper d-flex justify-content-end align-items-center">
                    <div class="form-group mb-0 mr-2">
                        <input type="text" class="form-control" id="search" placeholder="Search">
                    </div>
                    <button type="button" class="btn btn-primary mr-2" id="searchBtn">Search</button>
                    <button type="button" class="btn btn-secondary" id="refreshBtn">Refresh</button>
                </div>
            </div>
        </div>
    </div>

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


    function createScheduleTable($room, $conn, $sem) {
        $queryCount = "SELECT COUNT(*) AS result_count FROM table_sched WHERE room = ? AND Semester = ?";
        $stmtCount = $conn->prepare($queryCount);
        $stmtCount->bind_param("ss", $room, $sem);
        $stmtCount->execute();
        $resultCount = $stmtCount->get_result();
        $rowCount = $resultCount->fetch_assoc();
        $totalResults = $rowCount['result_count'];
    
        $query = "SELECT * FROM table_sched WHERE room = ? AND Semester = ? ORDER BY Start_Time";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $room, $sem);
        $stmt->execute();
        $result = $stmt->get_result();
        
        echo "<button class=\"convert-button\" data-table-id=\"$room--$sem\">Convert Table  to CSV</button>";
    
        echo "<div class='container'><table width='' class='table table-bordered' border='1' id='$room--$sem'>
        <thead>
                <tr><th colspan=\"13\" style=\"background-color: #165aec; color: white;\">$room ($totalResults)</th></tr>
                
                <tr>
                    <th style=\"background-color: Yellow;\">Room</th>
                    <th style=\"background-color: lightblue;\">Blocks</th>
                    <th style=\"background-color: lightblue;\">Faculty</th>
                    <th style=\"background-color: #7BCCB5;\">Start time</th>
                    <th style=\"background-color: #FFB4B4;\">End time</th>

                    <th style=\"background-color: Yellow;\">Mon</th>
                    <th style=\"background-color: Yellow;\">Tue</th>
                    <th style=\"background-color: Yellow;\">Wed</th>
                    <th style=\"background-color: Yellow;\">Thu</th>
                    <th style=\"background-color: Yellow;\">Fri</th>
                    <th style=\"background-color: Yellow;\">Sat</th>
                    <th style=\"background-color: Yellow;\">Sun</th>                 
                    <th style=\"background-color: orange;\">Action</th>
                    
                </tr></thead><tbody>";


    
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            // echo "<td>" . $row[$day] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['room'] . "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['blocks']  ."<a href='updateTablelist/updateBlockAndFac.php?id=". $row['id'] ."' title='Update Block And Faculty Name Record' data-toggle='tooltip' class='editFacName'><span class='glyphicon glyphicon-pencil'></span></a>". "</td>";
            echo "<td style=\"background-color: #F1F1F1;\">" . $row['faculty'] ."<a href='updateTablelist/updateBlockAndFac.php?id=". $row['id'] ."' title='Update Block And Faculty Name Record' data-toggle='tooltip' class='editFacName'><span class='glyphicon glyphicon-pencil'></span></a>". "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['Start_Time'])) . "</td>";
            echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['End_Time'])) . "</td>";
            echo "<td style='background-color: " . $row['Monday'] . "'>";
            if ($row['Monday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Monday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            echo "<td style='background-color: " . $row['Tuesday'] . "'>";
            if ($row['Tuesday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Tuesday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            echo "<td style='background-color: " . $row['Wednesday'] . "'>";
            if ($row['Wednesday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Wednesday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            // Repeat the above pattern for the remaining days of the week
            
            // Example for Thursday:
            echo "<td style='background-color: " . $row['Thursday'] . "'>";
            if ($row['Thursday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Thursday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            // Continue for Friday, Saturday, and Sunday
            
            // Example for Friday:
            echo "<td style='background-color: " . $row['Friday'] . "'>";
            if ($row['Friday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Friday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            // Repeat the same pattern for Saturday and Sunday
            
            // Example for Saturday:
            echo "<td style='background-color: " . $row['Saturday'] . "'>";
            if ($row['Saturday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";  
            } elseif ($row['Saturday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            
            // Example for Sunday:
            echo "<td style='background-color: " . $row['Sunday'] . "'>";
            if ($row['Sunday'] == 'green') {
                echo "<span class='glyphicon glyphicon-ok'style=\"color:#ccffff;\"><p style=\"color:#FFFFFF;opacity: 0;\">Yes</p></span>";      
            } elseif ($row['Sunday'] == 'red') {
                echo "<span class='glyphicon glyphicon-remove' style=\"color:black;\"><p style=\"color:#FFFFFF;opacity: 0;\">No</p></span>"; 
            } else {
                echo "Hello";
            }
            echo "</td>";
            // echo "</tr>";

            echo "<td>
        <form class='form-horizontal' method='post' action='" . $_SERVER['PHP_SELF'] . "'>
            <input name='id' type='hidden' value='" . $row['id'] . "'>
            <button type='submit' class='btn btn-danger' name='delete'  title=\"Delete Record\"> <span class='glyphicon glyphicon-trash'></span></button>
        </form>
    </td>";
echo "</tr>";

        }


        
        
       

                

        echo "</tbody></table></div>";
      
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
        $id = $_POST['id'];
        $deleteQuery = "DELETE FROM table_sched WHERE id = ?";
        $stmt = $conn->prepare($deleteQuery);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo '<script type="text/javascript">
                    alert("Schedule Successfully Deleted");
                    location="roomListSchedule.php";
                  </script>';
          
            exit;
        } else {
            echo 'Could not delete row: ' . $conn->error;
        }
    }

    // for the creation of table from Monday to sunday

    $query = "SELECT * FROM rooms ORDER BY room";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rooms = array();  // Create an empty array to store room values
    
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row['room'];  // Add each room value to the array
    }
    
    // foreach ($rooms as $room) {
    //     echo $room . "<br>";
    // }

        function semList($conn,$rooms,$sem){
            foreach ($rooms as $room) {
                createScheduleTable($room, $conn,$sem);
            }
    
        }


        semList($conn,$rooms,'1st Sem');
       
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
<legend><h3>Second Semester Schedule</h3></legend>

<?php
  semList($conn,$rooms,'2nd Sem');
 
?>

</fieldset>
    </form>
</div>
</div>
</div>
</div>


<script>
// for search option
document.addEventListener('DOMContentLoaded', function() {
            function searchInTables(keyword) {
                const tables = document.querySelectorAll('table');
            
                tables.forEach(table => {
                    const rows = table.querySelectorAll('tbody tr');
            
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
            
                        let rowVisible = false;
                        cells.forEach(cell => {
                            if (cell.textContent.includes(keyword)) {
                                rowVisible = true;
                            }
                        });
            
                        if (rowVisible) {
                            row.style.display = ''; // Show the row
                        } else {
                            row.style.display = 'none'; // Hide the row
                        }
                    });
                });
            }
            
            document.getElementById('searchBtn').addEventListener('click', function() {
                const searchInput = document.getElementById('search');
                const keyword = searchInput.value.trim();
            
                if (keyword !== '') {
                    searchInTables(keyword);
                }
            });
            
            document.getElementById('refreshBtn').addEventListener('click', function() {
                const rows = document.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    row.style.display = ''; // Show all rows
                });
            });
        });



// for csv file

document.querySelectorAll(".convert-button").forEach(function(button) {
  button.addEventListener("click", function() {
    const tableId = button.getAttribute("data-table-id");
    const table = document.getElementById(tableId);

    let csv = "";

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const rowData = [];

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        const cellData = cell.textContent;
        rowData.push(`"${cellData}"`);
      }

      csv += rowData.join(",") + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableId}_data.csv`;
    link.click();
  });
});



</script>


<!-- this code must be careful in how many times it is used it might have some storage issues  -->

<script>
    document.addEventListener("DOMContentLoaded", function (event) {
        var scrollpos = sessionStorage.getItem('scrollpos');
        if (scrollpos) {
            window.scrollTo(0, scrollpos);
            sessionStorage.removeItem('scrollpos');
        }
    });

    window.addEventListener("beforeunload", function (e) {
        sessionStorage.setItem('scrollpos', window.scrollY);
    });
</script>

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