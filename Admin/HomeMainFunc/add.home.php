  <?php 

  $con = mysqli_connect ('localhost', 'root', '', 'room_util_sys_db');
  if (!$con)
  {
    echo 'not connected to server';
  }
  mysqli_select_db($con, 'room_util_sys_db') or die(mysqli_error($con));//balik dri kung di mag gana

    

  function getPosts()
  {
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
      return $posts;
  }
  
  if (isset($_POST['insert'])) {
    
    $data = getPosts();

    $existing_Query = $query = "SELECT * FROM `table_sched` WHERE ( /*`faculty`='$data[0]'*/`blocks`='$data[1]' AND `room`='$data[3]') AND (`Monday`='$data[4]' OR `Tuesday`='$data[5]' OR `Wednesday`='$data[6]' OR `Thursday`='$data[7]'OR`Friday`='$data[8]' OR`Saturday`='$data[9]' OR `Sunday`='$data[10]')
    AND ((`start_time` <= '$data[12]' AND `end_time` >= '$data[11]')
        OR (`start_time` <= '$data[11]' AND `end_time` >= '$data[11]')
        OR (`start_time` >= '$data[11]' AND `end_time` <= '$data[12]'))";
    
    //`faculty`='$data[0]' OR `course`='$data[1]' OR `subject`='$data[2]' OR  
    //OR `weekDays`='$data[4]'   palagay sa taas//
    
    
    //="SELECT * FROM `addtable` WHERE `faculty`='$data[0]' OR `course`='$data[1]' OR `subject`='$data[2]' OR `room`='$data[3]' OR `weekDays`='$data[4]' OR `start_time`='$data[5]' OR `end_time`='$data[6]'";
    $existing_Result = mysqli_query($con, $existing_Query);
    if(0 < mysqli_num_rows ($existing_Result)){
      echo '<script type="text/javascript">
                        alert("your entry is already in the tale and has overlap/list. please choose another schedule.");
                          window.location="home.php";
                            </script>';
    } else {
      $insert_Query = "INSERT INTO `table_sched` (`faculty`, `blocks`, `subject`, `room`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`, `start_time`, `end_time`) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]','$data[5]', '$data[6]','$data[7]', '$data[8]', '$data[9]', '$data[10]', '$data[11]','$data[12]')";
      $insert_Result = mysqli_query($con, $insert_Query);
      
      if ($insert_Result) {
        echo "<script type='text/javascript'>
                        alert('New schedule added successfuly');
                          window.location='tablelist.php';
                            </script>";
      } else {
        echo "<script type='text/javascript'>
                        alert('Data not inserted!');
                          window.location='home.php';
                            </script>";
      }
    }

    
    }
  ?>





