<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/bootstrap.css">
    <script src="js/jquery.min.js"></script>
    <script src="js/bootstrap.js"></script>
    <style type="text/css">
          html, body {
    background-color: transparent;
  }

        .wrapper{
            width: 650px;
            margin: 0 auto;
        }
        .page-header h2{
            margin-top: 0;
        }
        table tr td:last-child a{
            margin-right: 15px;
        }


       
        .search-wrapper {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
    .search-wrapper .form-group {
        margin-bottom: 0;
    }
    .search-wrapper .form-group,
    .search-wrapper .buttons {
        flex-shrink: 0;
    }
    .search-wrapper .form-group input {
        margin-left: 10px;
    }


    </style>
    <script type="text/javascript">
        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();   
        });


       
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
    });


    document.addEventListener("DOMContentLoaded", function() {
        // Search button click event
        var searchBtn = document.getElementById("searchBtn");
        searchBtn.addEventListener("click", function() {
            // Your existing search filtering code
            // ...
        });

        // Refresh button click event
        var refreshBtn = document.getElementById("refreshBtn");
        refreshBtn.addEventListener("click", function() {
            location.reload(); // Reload the page
        });
    });
    </script>
</head>
<body>

<div class="container-fluid">
<div class="row">
    <div class="col-md-12">
        <div class="search-wrapper">
            <div class="form-group">
                <input type="text" class="form-control" id="search" placeholder="Search">
            </div>
            <div class="buttons">
                <button type="button" class="btn btn-primary" id="searchBtn">Search</button>
                <button type="button" class="btn btn-info" id="refreshBtn">Refresh</button>
            </div>
        </div>
    </div>
</div>

            <div class="row">
                <div class="col-md-12">
                    <div class="page-header clearfix">
                        <h2 class="pull-left">Blocks Details </h2>
                        <a href="create.php" class="btn btn-success pull-right">Add New Blocks</a>
                    </div>
                    <?php
                    // Include config file
                    require_once "config.php";
                    
                    // Attempt select query execution
                    $sql = "SELECT * FROM blocks_detail ORDER BY name,year_level";
                    if($result = mysqli_query($link, $sql)){
                        if(mysqli_num_rows($result) > 0){
                            echo "<table class='table table-bordered table-striped'>";
                                echo "<thead>";
                                    echo "<tr>";
                                        // echo "<th>#</th>";
                                        echo "<th>Name</th>";
                                        echo "<th>Year Level</th>";
                                        echo "<th>Advisor</th>";
                                        echo "<th style='text-align:center;'>Action</th>";
                                    echo "</tr>";
                                echo "</thead>";
                                echo "<tbody>";
                                
                                while($row = mysqli_fetch_array($result)){
                                    echo "<tr>";
                                        // echo "<td>" . $row['id'] . "</td>";
                                        echo "<td>" . $row['name'] . "</td>";
                                        echo "<td>" . $row['year_level'] . "</td>";
                                        echo "<td>" . $row['advisor'] . "</td>";
                                        // echo "<td>" . $row['name'] . "</td>";
                                        // echo "<td>" . $row['address'] . "</td>";
                                        // echo "<td>" . $row['salary'] . "</td>";
                                        echo "<td style='text-align:center'>";
                                            echo "<a href='read.php?id=". $row['id'] ."' title='View Record' data-toggle='tooltip'><span class='glyphicon glyphicon-eye-open'></span></a>";
                                            echo "<a href='update.php?id=". $row['id'] ."' title='Update Record' data-toggle='tooltip'><span class='glyphicon glyphicon-pencil'></span></a>";
                                            echo "<a href='delete.php?id=". $row['id'] ."' title='Delete Record' data-toggle='tooltip'><span class='glyphicon glyphicon-trash'></span></a>";
                                        echo "</td>";
                                    echo "</tr>";
                                }
                                echo "</tbody>";                            
                            echo "</table>";
                            // Free result set
                            mysqli_free_result($result);
                        } else{
                            echo "<p class='lead'><em>No records were found.</em></p>";
                        }
                    } else{
                        echo "ERROR: Could not able to execute $sql. " . mysqli_error($link);
                    }
                    
 
                    // Close connection
                    mysqli_close($link);
                    ?>

                    

                </div>
            </div>        
        </div>
    </div>

   </div> 

   </div>
</body>
</html>