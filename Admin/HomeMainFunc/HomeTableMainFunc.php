<?php
//include_once("header.php");
?>

<?php
//include 'heartbeat.php';
?>




<html>
<head>
    <!-- Add Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <style>
        html, body {
    background-color: transparent;
  }
  /* #myMainTable{
     display: none; 
  } */
 
        .officialTable{
            display: none;
        }
     
        .switchBut{
            cursor:pointer;
            border-radius: 1vw;
        }
        .switchBut:hover{
            background-color: beige;
            transition-duration: 1s;
        }
       
        .statusAvaiBut{
            border-radius: 1vw;
        }
    </style>
</head>

    



<body><br>

<button onclick="myFunction()" class='switchBut'>Switch View</button>

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



function statusFunc($faculty,$startTime,$endTime){
        //     $host = "localhost";
        // $username = "root";
        // $password = "";
        // $database = "room_util_sys_db";

                // select database
                $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                if ($conn->connect_error) {
                    die("Couldn't connect to the database: " . $conn->connect_error);
                }
                    $query = "SELECT * FROM it_faculty WHERE Name = '$faculty'";
                    
                    // Assuming you have a database connection, execute the query
                    $result = mysqli_query($conn, $query); // Replace $connection with your database connection variable
                    
                    // Check if the query was successful
                    if ($result) {
                        // Process the results
                        if (mysqli_num_rows($result) > 0) {
                            while ($row = mysqli_fetch_assoc($result)) {
                                $timestamp = $row['timestamp'];

                                    // Set the timezone to Asia/Manila
                                    $timezone = new DateTimeZone('Asia/Manila');
                                    date_default_timezone_set($timezone->getName());
                                    
                                    $currentDateTime = new DateTime('now', $timezone);//   $currentDateTime = new DateTime(null, $timezone); //this is the alternative if there is a bug in the afternoon time
                                    
                                   // echo $currentDateTime->format('Y-m-d H:i:s');
                                    

                                    // Create a DateTime object for the timestamp with the desired timezone
                                    $dateTime = new DateTime($timestamp, $timezone);

                                    // Calculate the time difference in minutes
                                    $timeDiffMinutes = round(($currentDateTime->getTimestamp() - $dateTime->getTimestamp()) / 60);

                                    // Calculate the date difference in days
                                    $dateDiffDays = $currentDateTime->diff($dateTime)->days;

                                    // Set the background color based on the time and date difference
                                    if ($dateDiffDays > 0 || $timeDiffMinutes > 900) {
                                        $backgroundColor = 'red';

                                        if ($dateDiffDays > 0) {
                                            $displayText = "Vacant $dateDiffDays day(s)";
                                        } else {
                                            if ($timeDiffMinutes <= 60) {
                                                $displayText = "Inactive $timeDiffMinutes min";
                                            } else {
                                                $hourdiff = floor($timeDiffMinutes / 60);
                                                $displayText = "Inactive $hourdiff hour(s)";
                                            }
                                        }

                                        echo "<button class='statusAvaiBut' style='background-color: $backgroundColor;margin:0;display:inline;'>$displayText</button>";
                                    } else {
                                        
                                        //  $current_time = "09:00:00";
                                                $current_time = $currentDateTime->format('H:i:s');
                                                //echo $startTime."<br>".$endTime."<br>".$current_time."<br>";

                                            $date1 = DateTime::createFromFormat('H:i:s', $current_time);
                                            $date2 = DateTime::createFromFormat('H:i:s', $startTime);
                                            $date3 = DateTime::createFromFormat('H:i:s', $endTime);
                                            
                                            if ($date1 > $date2 && $date1 < $date3) {
                                                // echo 'hooray';
                                                $backgroundColor = 'green';                              
                                                echo "<div class='statusAvaiBut' style='background-color: $backgroundColor;margin:0;width:50%;display:inline;padding:2%;color:white'>Active</div>";
                                            } else {
                                                // echo 'The current time is not within the specified range.';
                                                echo "<div class='statusAvaiBut' style='background-color:blue;margin:0;width:50%;display:inline;padding:2%;color:white'>Inactive</div>";
                                            }

                                                        // $backgroundColor = 'green';
                                                        // echo "<div style='background-color: $backgroundColor;margin:0;width:50%;display:inline;padding:2%;color:white'>Active</div>";
                                    }


                                // Echo the background color

                                // Output the <td> element with the background color
                                // echo "<a href='update.php?id=". $row['id'] ."' title='Update Record' data-toggle='tooltip'><span class='glyphicon glyphicon-pencil'></span></a> ";
                                // echo "<div style='background-color: $backgroundColor;margin:0;width:50%;display:inline;padding:1%;'>Active $timeDiffMinutes min ago</div>";
                            }
                        } else {
                            // echo "<a href='home.php? title='Update Record' data-toggle='tooltip'><span class='glyphicon glyphicon-pencil'></span></a>";

                            echo "No Faculty found.";
                        }
                        
                        // Free the result set
                        mysqli_free_result($result);
                    } else {
                        echo "Query failed: " . mysqli_error($conn); // Replace $connection with your database connection variable
                    }
                    
                    // Close the database connection
                    mysqli_close($conn); // Replace $connection with your database connection variable
     }



//function for the table
function createScheduleTable($day, $conn,$quarter) {
    $query = "SELECT
    ROW_NUMBER() OVER (ORDER BY table_sched.Start_Time ASC) AS id,
    rooms.room,
    table_sched.faculty,
    table_sched.blocks,
    table_sched.subject,
    table_sched.Start_Time,
    table_sched.End_Time
  FROM
    rooms
  LEFT JOIN
    table_sched ON rooms.room = table_sched.room AND table_sched.$day = 'green' AND Semester = '$quarter'
  ORDER BY
    table_sched.Start_Time ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    echo "<div class='container-fluid' style='margin-bottom:1%;'>
    <div class='row'>
        <div class='col-md-6'></div>
        <div class='col-md-6 text-right'>
            <div class='d-flex align-items-center justify-content-end'>
                <div class='form-group mr-2 d-flex' style='margin:auto 0;'>
                    <input type='text' class='form-control' id='search'>
                </div>
                <button type='button' class='btn btn-primary mr-2' id='searchBtn'>Search</button>
                <button type='button' class='btn btn-secondary' onclick='location.reload()'>Refresh</button>
            </div>
        </div>
    </div>
</div>";
    

 
        echo "<div class='container' id='myMainTable' ><table width='' class='table table-bordered theTable' border='1' style='background-color: rgba(242, 242, 242, 0.6);'>
               
                <thead>
                <tr><th colspan=\"7\" style=\"background-color: #165aec; color: white;text-align:center\">$day</th></tr>
                <tr>
                <th>Room</th>
                <th>Faculty</th>
                <th class='hide-column'>Block</th>
                <th class='hide-column'>Subject</th>
                <th>Time</th>              
                <th>Status</th>
                </tr>
                </thead>
                <tbody>";


    
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td style=\"text-align: center;\">" . ($row['room'] !== null ? $row['room'] : '-----') . "</td>";
            echo "<td style=\"text-align: center;\">" . ($row['faculty'] !== null ? $row['faculty'] : '-----') . "</td>";
            echo "<td style=\"text-align: center;\" class='hide-column'>" . ($row['blocks'] !== null ? $row['blocks'] : '-----') . "</td>";
            echo "<td style=\"text-align: center;\" class='hide-column'>" . ($row['subject'] !== null ? $row['subject'] : '-----') . "</td>";
            
            echo "<td style='   text-align: center;'>";

            if ($row['Start_Time'] !== null) {
               // echo date("h:i A", strtotime($row['Start_Time']));

               $start_time=$row['Start_Time'];
               list($hour,$minute,$second) = explode(':',$start_time);

               $timestamp = strtotime("$hour:$minute:$second-1 minute");
               $formattedTime = date("h:i A", $timestamp);

             echo $formattedTime;
             
            } else {
                echo '-----';
            }
            
            echo " - ";
            
            if ($row['End_Time'] !== null) {
                echo date("h:i A", strtotime($row['End_Time']));
            } else {
                echo '-----';
            }
            
            echo "</td>";
            
            
            // echo "<td>";
            
            // echo "<a href='read.php?id=". $row['id'] ."' title='View Record' data-toggle='tooltip'><span class='glyphicon glyphicon-eye-open'></span></a>";
            // echo "</td>";
            
            echo "<td class=\"statusRow\" style=\"text-align: center;\">";

            statusFunc($row['faculty'],$row['Start_Time'],$row['End_Time']);
            echo "</td>";

            

            //id=". $row['id'] ."
        }
        echo "</tbody> </table></div>";
    }

// for modification area ====================================

    function roomScheduleTable($currentDay,$quarter){
        
        function createSchedulTable($room, $conn,$currentDay,$quarter) {
           
            $query = "SELECT * FROM table_sched WHERE room = ? AND $currentDay = 'green' AND Semester = ? ORDER BY Start_Time;";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $room, $quarter); // Assuming $room and $quarter are strings, use "i" for integers, "d" for doubles, etc.
            $stmt->execute();
            $result = $stmt->get_result();
            
        
            echo "<div class='container officialTable'><table width='' class='table table-bordered ' border='1'>
            <thead>
                    <tr><th colspan=\"5\" style=\"background-color: #165aec; color: white;\">$room</th></tr>
                    <tr>
                        
                        <th style=\"background-color: lightblue;\">Blocks</th>
                        <th style=\"background-color: lightblue;\">Faculty</th>
                        <th style=\"background-color: #FFB4B4;\">Start time</th>
                        <th style=\"background-color: #FFB4B4;\">End time</th> 
                        <th style=\"background-color: #7BCCB5;\">Status</th>                 
                    </tr>
                    </thead>
                    <tbody>";
    
    
        
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                // echo "<td>" . $row[$day] . "</td>";
                // echo "<td style=\"background-color: #F1F1F1;\">" . $row['room'] . "</td>";
                echo "<td style=\"background-color: #F1F1F1;\">" . $row['blocks'] . "</td>";
                echo "<td style=\"background-color: #F1F1F1;\">" . $row['faculty'] . "</td>";
                echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['Start_Time'])) . "</td>";
                echo "<td  style=\"background-color: #F1F1F1;\">" . date("h:i A", strtotime($row['End_Time'])) . "</td>";

                echo "<td class=\"statusRow\" style=\"text-align: center;\">";

            statusFunc($row['faculty'],$row['Start_Time'],$row['End_Time']);
            echo "</td>";
               
                echo "</tr>";
            }
    
            
    
            echo "</tbody></table></div>";
        }
        
        // for the creation of table from Monday to sunday
        $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        die("Couldn't connect to the database: " . $conn->connect_error);
    }
    
        $query = "SELECT * FROM rooms";
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
    
            foreach ($rooms as $room) {
                createSchedulTable($room, $conn,$currentDay,$quarter);
            }
    

    };


    // ============== for month sem function


    $currentMonthText = date("F"); // "F" format gives you the full month name
            // echo "Current Month: " . $currentMonth;



    function getQuarter($month) {
        if ($month >= 8 && $month <= 12) {
            return '1st Sem';
        } elseif ($month >= 1 && $month <= 5) {
            return '2nd Sem';
        } else {
            return 'Vacation';
        }
    }
    
    $currentMonth = date("n"); // "n" format gives you the numeric month (1 to 12)
    $quarter = getQuarter($currentMonth);
    
   // echo "Current Quarter: " . $quarter;
    

    // ===========end for mont and sem function


// end of modification area ==================================
    $currentDay = date('l');
   // createScheduleTable(  "Monday", $conn);
    createScheduleTable(  $currentDay, $conn,$quarter);
    roomScheduleTable($currentDay,$quarter,$quarter);

?>







<?php
// include_once("navbar.php");
?>

<!-- Add Bootstrap JS -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
<!-- <script src="heartbeat.js"></script> -->

<script>

     document.addEventListener("DOMContentLoaded", function() {
        var searchBtn = document.getElementById("searchBtn");
        searchBtn.addEventListener("click", function() {
            var searchValue = document.getElementById("search").value.toLowerCase();
            var rows = document.querySelectorAll("tbody tr");
            rows.forEach(function(row) {
                var cells = row.getElementsByTagName("td");
                var found = false;
                Array.from(cells).forEach(function(cell) {
                    if (cell.textContent.toLowerCase().includes(searchValue)) {
                        found = true;
                    }
                });
                if (found) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });

        // var refreshBtn = document.getElementById("refreshBtn");
        // refreshBtn.addEventListener("click", function() {
        //     location.reload();
        // });

        // var startTimeHeader = document.querySelector("thead th:nth-child(5)");
        // startTimeHeader.addEventListener("click", function() {
        //     sortRowsByStartTime();
        // });

        // function sortRowsByStartTime() {
        //     var tableBody = document.querySelector("tbody");
        //     var rows = Array.from(tableBody.getElementsByTagName("tr"));

        //     rows.sort(function(rowA, rowB) {
        //         var startTimeA = rowA.querySelector("td:nth-child(5)").textContent.trim();
        //         var startTimeB = rowB.querySelector("td:nth-child(5)").textContent.trim();

        //         var timeA = new Date("1970/01/01 " + startTimeA);
        //         var timeB = new Date("1970/01/01 " + startTimeB);

        //         return timeA - timeB;
        //     });

        //     rows.forEach(function(row) {
        //         tableBody.appendChild(row);
        //     });


           

        // }

        // var amBtn = document.getElementById("amBtn");
        // var pmBtn = document.getElementById("pmBtn");

        // amBtn.addEventListener("click", function() {
        //     filterRowsByTime("AM");
        // });

        // pmBtn.addEventListener("click", function() {
        //     filterRowsByTime("PM");
        // });

        // function filterRowsByTime(time) {
        //     var rows = document.querySelectorAll("tbody tr");
        //     rows.forEach(function(row) {
        //         var startTime = row.querySelector("td:nth-child(5)").textContent.trim();
        //         var isAM = startTime.endsWith("AM");
        //         var isPM = startTime.endsWith("PM");

        //         if ((time === "AM" && isAM) || (time === "PM" && isPM)) {
        //             row.style.display = "";
        //         } else {
        //             row.style.display = "none";
        //         }
        //     });
        // }

        sortRowsByStartTime();
 });

    function myFunction() {
    var x = document.getElementById("myMainTable");
    var officialTables = document.getElementsByClassName("officialTable");

    if (x.style.display === "none") {
        x.style.display = "block";
        for (var i = 0; i < officialTables.length; i++) {
            officialTables[i].style.display = "none";
        }
    } else {
        x.style.display = "none";
        for (var i = 0; i < officialTables.length; i++) {
            officialTables[i].style.display = "block";
        }
    }
}



          </script>
</body>
</html>
<?php 
// include_once("footer.php");
?>

