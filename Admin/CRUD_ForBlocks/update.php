<?php
// Include config file
require_once "config.php";
 
// Define variables and initialize with empty values
$name = $yearLvl = $advisor = "";
$name_err = $yearLvl_err = $advisor_err = "";
 
// Processing form data when form is submitted
if(isset($_POST["id"]) && !empty($_POST["id"])){
    // Get hidden input value
    $id = $_POST["id"];
    
    // Validate name
    $input_name = trim($_POST["name"]);
    if (empty($input_name)) {
        $name_err = "Please enter Name.";
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_name)) {
        $name_err = "Please enter a Name.";
    } else {
        $name = $input_name;
    }
    
    //validate year Level
    $input_yearLvl = trim($_POST["yearLvl"]);
    if (empty($input_yearLvl)) {
        $yearLvl_err = "Please enter a Year Level.";
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_yearLvl)) {
        $yearLvl_err = "Please enter a Year Level.";
    } else {
        $yearLvl = $input_yearLvl;
    }

    //validiate advisor
    $input_advisor = trim($_POST["advisor"]);
    if (empty($input_advisor)) {
        $advisor_err = "Please enter advisor.";
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_advisor)) {
        $advisor_err = "Please enter a valid Advisor.";
    } else {
        $advisor = $input_advisor;
    }

     //validate advisory
    //  $input_advisory = trim($_POST["advisory"]);
    //  if (empty($input_advisory)) {
    //      $advisory_err = "Please enter advisory.";
    //  } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_advisory)) {
    //      $advisory_err = "Please enter a valid acadRank.";
    //  } else {
    //      $advisory = $input_advisory;
    //  }
 
    
    // Check input errors before inserting in database
    if (empty($name_err) && empty($yearLvl_err) && empty($advisor_err)) {
        // Prepare an update statement
        $sql = "UPDATE blocks_detail SET name=?, year_level=?, advisor=? WHERE id=?";
         
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "ssss", $param_name, $param_yearLvl, $param_advisor, $param_id);

            
            // Set parameters
            $param_name = $name;
            $param_yearLvl = $yearLvl;
            $param_advisor = $advisor;            
            $param_id = $id;
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                // Records updated successfully. Redirect to landing page
                header("location: index.php");
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
        $sql = "SELECT * FROM blocks_detail WHERE id = ?";
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
                    $name = $row["name"];
                    $yearLvl = $row["year_level"];
                    $advisor = $row["advisor"];
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

                        

                        <div class="form-group <?php echo (!empty($yearLvl_err)) ? 'has-error' : ''; ?>">
                            <label>Year Level</label>
                            <select name="yearLvl" class="form-control">
                                <option value="None">None</option>
                                <option value="1st year" <?php if ($yearLvl == '1st year') echo 'selected'; ?>>1st year</option>
                                <option value="2nd year" <?php if ($yearLvl == '2nd year') echo 'selected'; ?>>2nd year</option>
                                <option value="3rd year" <?php if ($yearLvl == '3rd year') echo 'selected'; ?>>3rd year</option>
                                <option value="4th year" <?php if ($yearLvl == '4th year') echo 'selected'; ?>>4th year</option>
                            </select>
                            <span class="help-block"><?php echo $yearLvl_err;?></span>
                        </div>

                        <!-- below is the dropdown for the advisor  -->

                        <div class="form-group <?php echo (!empty($advisor_err)) ? 'has-error' : ''; ?>">
                                    <label>Advisor</label>
                                    <select name="advisor" class="form-control">
                                        <option value="None">None</option>
                                        <?php
                                        // Step 1: Connect to the MySQL database
                                        $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                                        if (!$connection) {
                                            die('Connection failed: ' . mysqli_connect_error());
                                        }

                                        // Step 2: Retrieve data from the database
                                        $query = "SELECT Name FROM it_faculty ORDER BY Name";
                                        $result = mysqli_query($connection, $query);
                                        if (!$result) {
                                            die('Query failed: ' . mysqli_error($connection));
                                        }

                                        // Step 3: Create the options for the dropdown list
                                        while ($row = mysqli_fetch_assoc($result)) {
                                            $selected = ($advisor == $row['Name']) ? 'selected' : '';
                                            echo '<option value="' . $row['Name'] . '" ' . $selected . '>' . $row['Name'] . '</option>';
                                        }

                                        // Step 4: Close the database connection
                                        mysqli_close($connection);
                                        ?>
                                    </select>
                                    <span class="help-block"><?php echo $advisor_err;?></span>
                                </div>
                       
                       
                        <input type="hidden" name="id" value="<?php echo $id; ?>"/>
                        <input type="submit" class="btn btn-primary" value="Submit">
                        <a href="index.php" class="btn btn-default">Cancel</a>
                    </form>
                </div>
            </div>        
        </div>
    </div>
</body>
</html>