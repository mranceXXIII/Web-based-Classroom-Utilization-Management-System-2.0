<?php
//include_once("header.php");
?>

<!--  -->
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../../images/rsuLogo.png" type="image/x-icon"/>   


  <title>Classroom Utilization Management System</title>
<style>


.navbar {
    background-color: beige;
    border-radius: 10px;
    margin-bottom: 0;
}

.navbar ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: center;
}

.navbar li {
    margin-right: 15px;
}

.navbar a {
    text-decoration: none;
    color: #333;
    padding: 8px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: white;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.navbar a:hover {
    background-color: #333;
    color: #fff;
    border-color: #333;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .navbar ul {
        flex-wrap: wrap;
    }

    .navbar li {
        margin-right: 0;
        margin-bottom: 10px; /* Add space below each list item for better appearance */
    }
}
</style>
<script>
    window.onload = function() {
      if (window.self !== window.top) {
        // Page is loaded within an iframe
        var myList = document.getElementById('hideHome');
        myList.style.display = 'none';
      }
    };
</script>
</head>

<body>
    <div class="contNav">
        <nav class="navbar">
            <ul>
                <li><a href="../../admin.php" id="hideHome"><span class="glyphicon glyphicon-home"></span> Home</a></li>
                <li><a href="tablelist.php"><span class="glyphicon glyphicon-calendar"></span> Schedule</a></li>
                <li><a href="home.php"><span class="glyphicon glyphicon-plus-sign"></span> Add Schedule</a></li>
                <li><a href="addsubject.php"><span class="glyphicon glyphicon-plus-sign"></span> Subjects</a></li>
                <li><a href="addroom.php"><span class="glyphicon glyphicon-plus-sign"></span> Room</a></li>
                <li><a href="list.php"><span class="glyphicon glyphicon-list"></span> List</a></li>
            </ul>
        </nav>
    </div>
</body>
</html>






<!--  -->
<html>
<head>
    <!-- Add Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>


    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <style>
        
html, body {
    background-color: transparent;
  }
  
        th{
            text-align: center;
        }
        table td {
            text-align: center;
        }
         td{
            position: relative;
            margin: 0;
            padding: 0;
            font-size: 80%;
            
         }
        
         td:nth-child(4){
            font-size:1vw;
            font-weight: 600;
         }

        .editFacName{
            position:absolute;
            top: 0;
            right: 0;
        }

        .secondSem{
            display: none;
        }

        #toggleButton {
                transition: all 0.3s ease;
            }
    </style>

    <script type="text/javascript">
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

        var refreshBtn = document.getElementById("refreshBtn");
        refreshBtn.addEventListener("click", function() {
            location.reload();
        });

        var startTimeHeader = document.querySelector("thead th:nth-child(6)");
        startTimeHeader.addEventListener("click", function() {
            sortRowsByStartTime();
        });

        // function sortRowsByStartTime() {
        //     var tableBody = document.querySelector("tbody");
        //     var rows = Array.from(tableBody.getElementsByTagName("tr"));

        //     rows.sort(function(rowA, rowB) {
        //         var startTimeA = rowA.querySelector("td:nth-child(12)").textContent.trim();
        //         var startTimeB = rowB.querySelector("td:nth-child(12)").textContent.trim();

        //         var timeA = new Date("1970/01/01 " + startTimeA);
        //         var timeB = new Date("1970/01/01 " + startTimeB);

        //         return timeA - timeB;
        //     });

        //     rows.forEach(function(row) {
        //         tableBody.appendChild(row);
        //     });
        // }

        var First = document.getElementById("First");
        var Second = document.getElementById("Second");
        var Third = document.getElementById("Third");
        var Fourt = document.getElementById("Fourt");



        First.addEventListener("click", function() {
            filterRowsByYear("First");
        });

        Second.addEventListener("click", function() {
            filterRowsByYear("Second");
        });
        Third.addEventListener("click", function() {
            filterRowsByYear("Third");
        });
        Fourt.addEventListener("click", function() {
            filterRowsByYear("Fourt");
        });



        function filterRowsByYear(yr) {
            var rows = document.querySelectorAll("tbody tr");
            rows.forEach(function(row) {
                var startName = row.querySelector("td:nth-child(3)").textContent.trim();
                var firstyear = startName.startsWith("BSIT 1");
                var secondyear = startName.startsWith("BSIT 2");
                var Thirdyear = startName.startsWith("BSIT 3");
                var Fourtyear = startName.startsWith("BSIT 4");

                if ((yr === "First" && firstyear) || (yr === "Second" && secondyear)|| (yr === "Third" && Thirdyear)|| (yr === "Fourt" && Fourtyear)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        }

        // sortRowsByStartTime();

    });



    function myFunction() {
    var x = document.getElementsByClassName("firstSem");
    var officialTables = document.getElementsByClassName("secondSem");
    var button = document.getElementById("toggleButton");

    for (var i = 0; i < x.length; i++) {
        if (getComputedStyle(x[i]).display === "none") {
            fadeIn(x[i]);
        } else {
            fadeOut(x[i]);
        }
    }

    for (var i = 0; i < officialTables.length; i++) {
        if (getComputedStyle(officialTables[i]).display === "none") {
            fadeIn(officialTables[i]);
        } else {
            fadeOut(officialTables[i]);
        }
    }

    // Change button text
    if (button.textContent === "2nd Sem") {
        button.textContent = "1st Sem";
    } else {
        button.textContent = "2nd Sem";
    }
}

function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = "block";

    var opacity = 0;
    var interval = setInterval(function () {
        if (opacity < 1) {
            opacity += 0.05;
            element.style.opacity = opacity;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function fadeOut(element) {
    var opacity = 1;
    var interval = setInterval(function () {
        if (opacity > 0) {
            opacity -= 0.05;
            element.style.opacity = opacity;
        } else {
            clearInterval(interval);
            element.style.display = "none";
        }
    }, 20);
}


</script>

</head>

<body>

<div class="container-fluid" style="position: sticky;top:2px;z-index:11;">
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
<div style="position: sticky;top:5%;z-index:10;">
<button type="button" class="btn btn-primary" id="First">1st yr</button>
<button type="button" class="btn btn-primary" id="Second">2nd yr</button>
<button type="button" class="btn btn-primary" id="Third">3rd yr</button>
<button type="button" class="btn btn-primary" id="Fourt">4rt yr</button>
<button type="button" class="btn btn-danger" id="toggleButton" onclick="myFunction(this)">1st Sem</button>
</div>

<div  style="position: absolute;top:15%;right:40px;display:none;" >
    <br>
    <a href="home.php"><input type='submit' class='btn btn-success' name='delete' value='Add New Schedule' style="width: 100%;margin:2%;"></a>
</div>

<div align="center">

                <?php
                
                    require_once "config.php";

                    function myTableRow($sem, $semester,$idTable){
                        
                        echo"<fieldset class='$sem'>
                        <legend>Education Department Schedule </legend>";
                        echo"<button class='convert-button $sem btn btn-info' title='Download File CSV' style='float:right;margin-top:0;'><span class='material-symbols-outlined' style='font-size:3vh;'>file_copy</span></button>";
                        echo "
                        <table class=\"table table-bordered \" style=\"padding:0;\" id='$idTable'>
                            <thead>
                                <tr>
                                    <th>Room</th>
                                    <th>Faculty</th>
                                    <th>Block</th>
                                    <th>Subject</th>
                                    <!-- <th>Day</th> -->
                                    <th>Mon</th>
                                    <th>Tues</th>
                                    <th>Wed</th>
                                    <th>Th</th>
                                    <th>Fri</th>
                                    <th>Sat</th>
                                    <th>Sun</th>
                                    <th>Start time</th>
                                    <th>End time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                        ";
                        
                            
                            // select database
                            $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                            if ($conn->connect_error) {
                                die("Couldn't connect to the database: " . $conn->connect_error);
                            }

                            // $query = "SELECT * FROM table_sched ";
                            $query = "SELECT * FROM table_sched WHERE Semester= '$semester' ORDER BY blocks ASC, Start_Time";
                            $stmt = $conn->prepare($query);
                            $stmt->execute();
                            $result = $stmt->get_result();

                            while ($row = $result->fetch_assoc()) {
                                echo "<tr >";
                                echo "<td>" . $row['room'] . "</td>";
                                echo "<td>" . $row['faculty'] ."<a href='updateFacName.php?id=". $row['id'] ."' title='Update Faculty Name Record' data-toggle='tooltip' class='editFacName'><span class='glyphicon glyphicon-pencil'></span></a>"."</td>";
                                echo "<td>" . $row['blocks'] ."<a href='updateTablelist/updateBlock.php?id=". $row['id'] ."' title='Update Block Name Record' data-toggle='tooltip' class='editFacName'><span class='glyphicon glyphicon-pencil'></span></a>". "</td>";
                                echo "<td>" . $row['subject'] ."<a href='updateTablelist/updateSub.php?id=". $row['id'] ."' title='Update Subject Name Record' data-toggle='tooltip' class='editFacName'><span class='glyphicon glyphicon-pencil'></span></a>". "</td>";
                                // echo "<td>" . $row['weekdays'] . "</td>";

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
                                



                                echo "<td>" . date("h:i A", strtotime($row['Start_Time'])) . "</td>";
                                echo "<td>" . date("h:i A", strtotime($row['End_Time'])) . "</td>";

                                echo "<td>
                                        <form class='form-horizontal' method='post' action='" . $_SERVER['PHP_SELF'] . "'>
                                            <input name='id' type='hidden' value='" . $row['id'] . "'>
                                            <button type='submit' class='btn btn-danger' name='delete'  title=\"Delete Record\"> <span class='glyphicon glyphicon-trash'></span></button>
                                        </form>
                                    </td>";
                                echo "</tr>";

                              
                            }

                            // delete record
                            if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
                                $id = $_POST['id'];
                                $deleteQuery = "DELETE FROM table_sched WHERE id = ?";
                                $stmt = $conn->prepare($deleteQuery);
                                $stmt->bind_param("i", $id);
                                if ($stmt->execute()) {
                                    echo '<script type="text/javascript">
                                            alert("Schedule Successfully Deleted");
                                            location="tablelist.php";
                                        </script>';
                                    exit;
                                } else {
                                    echo 'Could not delete row: ' . $conn->error;
                                }
                            }


                            echo"  </tbody>
                              </table>
                              </fieldset>
                             ";

                                }
                            

                        myTableRow('firstSem','1st Sem','fistSemID');
                        myTableRow('secondSem','2nd Sem','secondSemID');
                ?>
            </div>
   




<!-- Add Bootstrap JS -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>


<script>
    document.querySelectorAll(".convert-button").forEach(function(button, index) {
  button.addEventListener("click", function() {
    const tables = document.querySelectorAll(".table");
    const table = tables[index]; // Get the table corresponding to the button's index

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
    link.download = `Schedule_Semester_${index + 1}_data.csv`;
    link.click();
  });
});





</script>

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
