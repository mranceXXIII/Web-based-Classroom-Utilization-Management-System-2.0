<?php
require_once "config.php";

$con = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
if (!$con) {
    die('Not connected to the server: ' . mysqli_connect_error());
}

mysqli_select_db($con, DB_NAME) or die('Database selection failed: ' . mysqli_error($con));

function getPosts() {
    $posts = array();
    $posts[0] = $_POST['faculty'];
    $posts[1] = $_POST['blocks'];
    $posts[2] = $_POST['subject'];
    $posts[3] = $_POST['room'];
    $posts[4] = isset($_POST['Monday']) ? $_POST['Monday'] : 'red';
    $posts[5] = isset($_POST['Tuesday']) ? $_POST['Tuesday'] : 'red';
    $posts[6] = isset($_POST['Wednesday']) ? $_POST['Wednesday'] : 'red';
    $posts[7] = isset($_POST['Thursday']) ? $_POST['Thursday'] : 'red';
    $posts[8] = isset($_POST['Friday']) ? $_POST['Friday'] : 'red';
    $posts[9] = isset($_POST['Saturday']) ? $_POST['Saturday'] : 'red';
    $posts[10] = isset($_POST['Sunday']) ? $_POST['Sunday'] : 'red';
    $posts[11] = $_POST['start_time'];
    $posts[12] = $_POST['end_time'];
    $posts[13] = $_POST['semester'];

    return $posts;
}

if (isset($_POST['insert'])) {
    $data = getPosts();

    // Debug: Print the data array for verification  // `room` = '$data[3]' AND `blocks` = '$data[1]'
        // AND 
    echo "<pre>";
    print_r($data);
    echo "</pre>";

    $existing_Query = "
    SELECT *
    FROM `table_sched`
    WHERE 
        (`room` = '$data[3]')
        AND (
            (`Monday`='green' AND '$data[4]' = 'green') OR
            (`Tuesday`='green' AND '$data[5]' = 'green') OR
            (`Wednesday`='green' AND '$data[6]' = 'green') OR
            (`Thursday`='green' AND '$data[7]' = 'green') OR
            (`Friday`='green' AND '$data[8]' = 'green') OR
            (`Saturday`='green' AND '$data[9]' = 'green') OR
            (`Sunday`='green' AND '$data[10]' = 'green')
        )
        AND (
            (
                (`Start_Time` <= '$data[12]' AND `End_Time` >= '$data[11]') -- Existing slot fully overlaps the new slot
                OR (`Start_Time` < '$data[11]' AND `End_Time` > '$data[12]') -- Existing slot surrounds the new slot
                OR (`Start_Time` >= '$data[11]' AND `Start_Time` <= '$data[12]') -- Existing slot starts within the new slot
                OR (`End_Time` >= '$data[11]' AND `End_Time` <= '$data[12]')
            )
        );
    
    
";

// (
//     -- Check for time overlaps
//     (`Start_Time` <= '$data[12]' AND `End_Time` >= '$data[11]')
//     OR (`Start_Time` < '$data[11]' AND `End_Time` > '$data[11]' AND `End_Time` <= '$data[12]')
//     OR (`Start_Time` > '$data[11]' AND `Start_Time` < '$data[12]' AND `End_Time` >= '$data[12]')
//     OR (`Start_Time` >= '$data[11]' AND `End_Time` <= '$data[12]')
//     OR (`Start_Time` < '$data[12]' AND `End_Time` > '$data[11]')
// )


    // Debug: Print the query for verification
    echo "Query: $existing_Query<br>";
  
    $existing_Result = mysqli_query($con, $existing_Query);
    if (!$existing_Result) {
        die('Query failed: ' . mysqli_error($con));
    }
    
    // Debug: Print the number of rows retrieved
    $numRows = mysqli_num_rows($existing_Result);
    echo "Number of Rows: $numRows<br>";

    if ($numRows > 0) {
        while ($row = mysqli_fetch_assoc($existing_Result)) {
            if ($row['Semester'] == '1st Sem' && $data[13] == '1st Sem') {
                echo '<script type="text/javascript">
                    alert("Your entry is already in the table / has overlap list for the 1st Semester. Please choose another schedule.");
                    window.location="home.php";
                    </script>';
                exit; // Exit the script
            } elseif ($row['Semester'] == '2nd Sem' && $data[13] == '2nd Sem') {
                echo '<script type="text/javascript">
                    alert("Your entry is already in the table / has overlap list for the 2nd Semester. Please choose another schedule.");
                    window.location="home.php";
                    </script>';
                exit; // Exit the script
            }
        }
    }

    // Debug: Print the insert query for verification
    echo "Insert Query: $insert_Query<br>";
    
    $insert_Query = "INSERT INTO `table_sched` (`faculty`, `blocks`, `subject`, `room`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`, `Start_Time`, `End_Time`, `Semester`) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]', '$data[6]', '$data[7]', '$data[8]', '$data[9]', '$data[10]', '$data[11]', '$data[12]', '$data[13]')";
    $insert_Result = mysqli_query($con, $insert_Query);

    if (!$insert_Result) {
        die('Insertion failed: ' . mysqli_error($con));
    }

    if ($insert_Result) {
        echo "<script type='text/javascript'>
              alert('New schedule added successfully');
              window.location='home.php';
              </script>";
    } else {
        echo "<script type='text/javascript'>
              alert('Data not inserted!');
              window.location='home.php';
              </script>";
    }
}
?>
