<?php

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

 $query = "SELECT * FROM exprimental_studentlist";
 $stmt = $conn->prepare($query);
 $stmt->execute();
 $result = $stmt->get_result();


// delete record
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = $_POST['id'];
    $deleteQuery = "DELETE FROM exprimental_studentlist WHERE id = ?";
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        // echo '<script type="text/javascript">
        //         alert("Row Successfully Deleted");
        //         location="studentList.php";
        //       </script>';

       // exit;
       header("Location: studentList.php");
        exit;
    } else {
        echo 'Could not delete row: ' . $conn->error;
    }
}

?>

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

<div class="container">
<button style="float: right; background-color: #007bff; color: #fff; padding: 10px 20px; border: none; border-radius: 4px;">
  <a href="addStudent.php" style="text-decoration: none; color: inherit;">Add Student</a>
</button>

    <body>
    <?php
    echo "<tr>
            <td>";
   echo" <button class=\"convert-button\" data-table-id=\"tableListOfStudent\">Convert List of Student to CSV</button>";
    echo "<div class='container'><table width='' id='tableListOfStudent' class='table table-bordered' border='1' >

             <caption><h2>List of student</h2></caption>
            
            <tr>
                <th>Student</th>
                <th>Action</th>
            </tr>";
         
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['Name'] . "</td>";
        echo "<td>
                <form class='form-horizontal' method='post' action='studentList.php'>
                    <input name='id' type='hidden' value='" . $row['id'] . "'>
                    <input type='submit' class='btn btn-danger' name='delete' value='Delete'>
                </form>
            </td>";
        echo "</tr>";
    }
    echo "</table></div>";

    
    ?>
    </fieldset>
    </form>
</div>
</div>
</div>
</div>
<br><br><br>
<?php
include_once("registerStudent.php");
?>



<body>
   

<script>
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



        // for the csv file

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
</body>
</html> 
<?php
include_once("footer.php");
?>


