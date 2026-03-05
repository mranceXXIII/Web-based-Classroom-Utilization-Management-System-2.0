<?php 
 
 require_once "config.php";
 //DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME

 $con = mysqli_connect (DB_SERVER, DB_USERNAME, DB_PASSWORD);
 
 if (!$con)
 {
	 echo 'not connected to server';
 }
 if (!mysqli_select_db($con, DB_NAME))
 {
	 echo 'database not selected';
 }

 $Start_Time = $_POST['starttime'];
 $End_Time = $_POST['endtime'];
 
 $sql = "INSERT INTO timer (Start_Time, End_Time) VALUES ('$Start_Time', '$End_Time')";

 if (!mysqli_query ($con, $sql))
 {
	 echo 'not inserted';
 }
 else
 {
	 echo '<script type="text/javascript">
                      alert("New Time Added!");
                         location="home.php";
                           </script>';
 }
 

?>