<?php
// Include config file
require_once "config.php";

// Define variables and initialize with empty values
$name = $yearLvl = $advisor = "";
$name_err = $yearLvl_err = $advisor_err = "";

// Processing form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
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


    //validate advisor
    $input_advisor = trim($_POST["advisor"]);
    if (empty($input_advisor)) {
        $advisor_err = "Please enter advisor.";
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-_@#$%^&*()]+$/", $input_advisor)) {
        $advisor_err = "Please enter a valid Advisory.";
    } else {
        $advisor = $input_advisor;
    }


    // Validate email
    // $input_email = trim($_POST["email"]);
    // if (empty($input_email)) {
    //     $email_err = "Please enter an email address.";
    // } elseif (!filter_var($input_email, FILTER_VALIDATE_EMAIL)) {
    //     $email_err = "Please enter a valid email address.";
    // } else {
    //     $email = $input_email;
    // }

    // Check input errors before inserting in database
    if (empty($name_err) && empty($yearLvl_err) && empty($advisor_err)) {
        // Prepare an insert statement
        $sql = "INSERT INTO blocks_detail (name,year_level,advisor) VALUES (?, ?, ?)";

        if ($stmt = mysqli_prepare($link, $sql)) {
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "sss", $param_name, $param_yearLvl, $param_advisor);

            // Set parameters
            $param_name = $name;
            $param_yearLvl = $yearLvl;
            $param_advisor = $advisor;
           

            // Attempt to execute the prepared statement
            if (mysqli_stmt_execute($stmt)) {
                // Records created successfully. Redirect to landing page
                header("location: index.php");
                exit();
            } else {
                echo "Something went wrong. Please try again later.";
            }
        }

        // Close statement
        mysqli_stmt_close($stmt);
    }

    // Close connection
    mysqli_close($link);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create Record</title>
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
                        <h2>Create Record</h2>
                    </div>
                    <p>Please fill this form and submit to add employee record to the database.</p>
                    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">

                        <div class="form-group <?php echo (!empty($name_err)) ? 'has-error' : ''; ?>">
                            <label>Name</label>
                            <input type="text" name="name" class="form-control" value="<?php echo $name; ?>">
                            <span class="help-block"><?php echo $name_err;?></span>
                        </div>
                        
                        <div class="form-group <?php echo (!empty($yearLvl_err)) ? 'has-error' : ''; ?>">
                            <label>Year Level</label>
                            <select name="yearLvl" class="form-control">
                                <option value="">Select Year Level</option>
                                <option value="1st year" <?php if ($yearLvl == '1st year') echo 'selected'; ?>>1st year</option>
                                <option value="2nd year" <?php if ($yearLvl == '2nd year') echo 'selected'; ?>>2nd year</option>
                                <option value="3rd year" <?php if ($yearLvl == '3rd year') echo 'selected'; ?>>3rd year</option>
                                <option value="4th year" <?php if ($yearLvl == '4th year') echo 'selected'; ?>>4th year</option>
                            </select>
                            <span class="help-block"><?php echo $yearLvl_err;?></span>
                        </div>


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

                        <input type="submit" class="btn btn-primary" value="Submit">
                        <a href="index.php" class="btn btn-default">Cancel</a>
                    </form>
                </div>
            </div>        
        </div>
    </div>
</body>
</html>
