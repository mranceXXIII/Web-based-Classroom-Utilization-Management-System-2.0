<?php

?>

<?php
// Include config file
require_once "config.php";
 
// Define variables and initialize with empty values
$name = $acadRank = $advisory = "";
$name_err = $acadRank_err = $advisory_err = "";
 
// Processing form data when form is submitted
if(isset($_POST["id"]) && !empty($_POST["id"])){
    // Get hidden input value
    $id = $_POST["id"];
    
    // Validate name
    $input_name = trim($_POST["name"]);
    if(empty($input_name)){
        $name_err = "Please enter a name.";
    } elseif(!filter_var($input_name, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^[a-zA-Z\s]+$/")))){
        $name_err = "Please enter a valid name.";
    } else{
        $name = $input_name;
    }
    
    //validate academic rank
    $input_acadRank = trim($_POST["acadRank"]);
    if (empty($input_acadRank)) {
        $acadRank_err = "Please enter a academic rank.";
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_acadRank)) {
        $acadRank_err = "Please enter a valid acadRank.";
    } else {
        $acadRank = $input_acadRank;
    }

     //validate advisory
     $input_advisory = trim($_POST["advisory"]);
     if (empty($input_advisory)) {
         $advisory_err = "Please enter advisory.";
     } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_advisory)) {
         $advisory_err = "Please enter a valid acadRank.";
     } else {
         $advisory = $input_advisory;
     }
 
    
    // Check input errors before inserting in database
    if (empty($name_err) && empty($acadRank_err) && empty($advisory_err)) {
        // Prepare an update statement
        $sql = "UPDATE it_faculty SET Name=?, Academic_Rank=?, Advisory=? WHERE id=?";
         
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "ssss", $param_name, $param_acadRank, $param_advisory, $param_id);

            
            // Set parameters
            $param_name = $name;
            $param_acadRank = $acadRank;
            $param_advisory = $advisory;            
            $param_id = $id;
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                // Records updated successfully. Redirect to landing page
                header("location: HomeTableMainFunc.php");
                exit();
            } else{
                echo "Something went wrong. Please try again later.";
            }
        }
         
        // Close statement
        mysqli_stmt_close($stmt);
    }
    
    // Close connection
    mysqli_close($link);
} else{
    // Check existence of id parameter before processing further
    if(isset($_GET["id"]) && !empty(trim($_GET["id"]))){
        // Get URL parameter
        $id =  trim($_GET["id"]);
        
        // Prepare a select statement
        $sql = "SELECT * FROM it_faculty WHERE id = ?";
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "i", $param_id);
            
            // Set parameters
            $param_id = $id;
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                $result = mysqli_stmt_get_result($stmt);
    
                if(mysqli_num_rows($result) == 1){
                    /* Fetch result row as an associative array. Since the result set contains only one row, we don't need to use while loop */
                    $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
                    
                    // Retrieve individual field value
                    $name = $row["Name"];
                    $acadRank = $row["Academic_Rank"];
                    $advisory = $row["Advisory"];
                    // $salary = $row["salary"];
                    // $Email = $row["Email"];
                } else{
                    // URL doesn't contain valid id. Redirect to error page
                    header("location: error.php");
                    exit();
                }
                
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }
        }
        
        // Close statement
        mysqli_stmt_close($stmt);
        
        // Close connection
        mysqli_close($link);
    }  else{
        // URL doesn't contain id parameter. Redirect to error page
        header("location: error.php");
        exit();
    }
}
?>
 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Update Record</title>
    <link rel="stylesheet" href="css/bootstrap.css">
    <style type="text/css">
        .wrapper{
            width: 500px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12">
                    <div class="page-header">
                        <h2>Update Record</h2>
                    </div>
                    <p>Please edit the input values and submit to update the record.</p>
                    <form action="<?php echo htmlspecialchars(basename($_SERVER['REQUEST_URI'])); ?>" method="post">
                        <div class="form-group <?php echo (!empty($name_err)) ? 'has-error' : ''; ?>">
                            <label>Name</label>
                            <input type="text" name="name" class="form-control" value="<?php echo $name; ?>">
                            <span class="help-block"><?php echo $name_err;?></span>
                        </div>

                        

                        <div class="form-group <?php echo (!empty($acadRank_err)) ? 'has-error' : ''; ?>">
                            <label>Academic Rank</label>
                            <input type="text" name="acadRank" class="form-control" value="<?php echo $acadRank; ?>">
                            <span class="help-block"><?php echo $acadRank_err;?></span>
                        </div>


                        <div class="form-group <?php echo (!empty($advisory_err)) ? 'has-error' : ''; ?>">
                                    <label>Advisory</label>
                                    <select name="advisory" class="form-control">
                                    <option value="None">None</option>
                                        <?php
                                        // Step 1: Connect to the MySQL database
                                        $connection = mysqli_connect('localhost', 'root', '', 'room_util_sys_db');
                                        if (!$connection) {
                                            die('Connection failed: ' . mysqli_connect_error());
                                        }

                                        // Step 2: Retrieve data from the database
                                        $query = "SELECT name FROM blocks_detail";
                                        $result = mysqli_query($connection, $query);
                                        if (!$result) {
                                            die('Query failed: ' . mysqli_error($connection));
                                        }

                                        // Step 3: Create the options for the dropdown list
                                        while ($row = mysqli_fetch_assoc($result)) {
                                            $selected = ($advisory == $row['name']) ? 'selected' : '';
                                            echo '<option value="' . $row['name'] . '" ' . $selected . '>' . $row['name'] . '</option>';
                                        }

                                        // Step 4: Close the database connection
                                        mysqli_close($connection);
                                        ?>
                                    </select>
                                    <span class="help-block"><?php echo $advisory_err;?></span>
                                </div>

                        <!-- <div class="form-group <?php echo (!empty($advisory_err)) ? 'has-error' : ''; ?>">
                            <label>Advisory</label>
                            <input type="text" name="advisory" class="form-control" value="<?php echo $advisory; ?>">
                            <span class="help-block"><?php echo $advisory_err;?></span>
                        </div> -->
                       
                       
                        <input type="hidden" name="id" value="<?php echo $id; ?>"/>
                        <input type="submit" class="btn btn-primary" value="Submit">
                        <a href="HomeTableMainFunc.php" class="btn btn-default">Cancel</a>
                    </form>
                </div>
            </div>        
        </div>
    </div>
</body>
</html>