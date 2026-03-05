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

 $Room = $_POST['room'];

 
 $sql = "INSERT INTO rooms (Room) VALUES ('$Room')";

 if (!mysqli_query ($con, $sql))
 {
	 echo 'not inserted';
 }
 else
 {
	 echo '<script type="text/javascript">
                      alert("New Room Reserved!");
                         location="addroom.php";
                           </script>';
 }
 

?>