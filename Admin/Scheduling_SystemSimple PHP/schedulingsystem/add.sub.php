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

 $Subject_Code = $_POST['subcode'];
 $Subject_Description = $_POST['subdescription'];
 
 $sql = "INSERT INTO subject (Subject_Code, Subject_Description) VALUES ('$Subject_Code', '$Subject_Description')";

 if (!mysqli_query ($con, $sql))
 {
	 echo 'not inserted';
 }
 else
 {
	 echo '<script type="text/javascript">
                      alert("New Subject Added!");
                         location="addsubject.php";
                           </script>';
 }
 

?>
