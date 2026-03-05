<?php

// php select option value from database

        // $hostname = "localhost";
        // $username = "root";
        // $password = "";
        // $databaseName = "room_util_sys_db";
    require_once "config.php";

// connect to mysql database

$connect = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// mysql select query
$query = "SELECT * FROM `blocks_detail` ORDER BY name,year_level";

// // for method 1

 $result1 = mysqli_query($connect, $query);

// for method 2
$query = "SELECT * FROM `it_faculty` ORDER BY  `Name` ASC";
$result2 = mysqli_query($connect, $query);

$options = "";

while($row2 = mysqli_fetch_array($result2))
{
    $options = $options."<option>$row2[1]</option>";
}

?>


<?php
  $path = $_SERVER['DOCUMENT_ROOT'];
   $path .= "header.php";
   include_once("header.php");
   
?>

<html>
<head>
<style>
body {
	background-color: white;
}

</style>
</head>
<body>
<br><div class="container" >
	
  <div class="row" align="center">
    <div class="col-lg-6">
		<div class="jumbotron">
		Here you will set your schedules
		<form class="form-horizontal" method= "post" action = "add.home.php">
			<fieldset>

			<!-- Form Name -->
			<legend>Set Schedule</legend>


        <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

    </head>

    <body>
        
		<!-- Method Two -->
        <div class="form-group">
			<label class="col-md-4 control-label" for="faculty">Faculty</label> 
			<div class="col-md-5">
		<select id="faculty" name="faculty" class="form-control">
        <option value="None">None</option>
            <?php echo $options;?>
        </select>
		</div>
		</div>
		
        <!--Method One-->
        <div class="form-group">
			<label class="col-md-4 control-label" for="blocks">Blocks</label> 
			<div class="col-md-5">
		<select  id="blocks" name="blocks"  class="form-control">
        <option  value="None">None</option>
            <?php while($row1 = mysqli_fetch_array($result1)):;?>
            

            <option  value="<?php echo $row1[1];?>"><?php echo $row1[1];?></option>

            <?php endwhile;?>

        </select>
        
        

		</div>		
    </div>
    </body>
</head>
</html>
 
<?php

// php select option value from database

// $hostname = "localhost";
// $username = "root";
// $password = "";
// $databaseName = "room_util_sys_db";

// connect to mysql database

$connect = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// mysql select query
$query = "SELECT * FROM `rooms`ORDER BY `room` ASC";

// for method 1

$result1 = mysqli_query($connect, $query);

// for method 2
$query = "SELECT * FROM `subject` ORDER BY subject_description";
$result2 = mysqli_query($connect, $query);


$options = "";

while($row2 = mysqli_fetch_array($result2))
{
    $options = $options."<option>$row2[2]</option>";
}

?>


<html>
<head>
</head>
<body>


        <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

    </head>

    <body>
        
		<!-- Method Two -->
        <div class="form-group">
			<label class="col-md-4 control-label" for="subject">Subject</label> 
			<div class="col-md-5">
		<select  id="subject" name="subject"  class="form-control">
            <option value="None">None</option>
            <?php echo $options;?>
        </select>
		</div>
		</div>
		
        

            <?php while($row2 = mysqli_fetch_array($result2)):;?>

            <option value="<?php echo $row2[0];?>"><?php echo $row2[2];?></option>

            <?php endwhile;?>

        </select> 
		<?php

// php select option value from database

// $hostname = "localhost";
// $username = "root";
// $password = "";
// $databaseName = "room_util_sys_db";

// connect to mysql database

$connect = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// mysql select query
$query = "SELECT * FROM `rooms`ORDER BY `room` ASC";

// for method 1

$result1 = mysqli_query($connect, $query);

// for method 2
$query = "SELECT * FROM `rooms`ORDER BY `room` ASC";
$result2 = mysqli_query($connect, $query);


$options = "";

while($row2 = mysqli_fetch_array($result2))
{
    $options = $options."<option>$row2[1]</option>";
}

 
?>



<html>
<head>
    <style>

.checkbox-block {
    display: block;
    margin-bottom: 10px;
    text-align: left;
}
    </style>
</head>

<meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

    </head>

    <body>
        
		<!-- Method Two -->
        <div class="form-group">
			<label class="col-md-4 control-label" for="room">Room</label> 
			<div class="col-md-5">
		<select  id="room" name="room"  class="form-control">
            <?php echo $options;?>
        </select>
		</div>
		</div>
		
        <!--Method One-->
        
       

            <?php while($row2 = mysqli_fetch_array($result2)):;?>

            <option value="<?php echo $row2[0];?>"><?php echo $row2[1];?></option>
			

            <?php endwhile;?>

        </select>
        
<!-- =========================Modification area================================= -->
<div class="form-group">
    <label class="col-md-4 control-label" for="weekdays">Weekdays</label>
    <div class="col-md-5">
        <label class="checkbox-block">
            <input type="checkbox" name="Monday" value="green"> Monday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Tuesday" value="green"> Tuesday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Wednesday" value="green"> Wednesday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Thursday" value="green"> Thursday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Friday" value="green"> Friday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Saturday" value="green"> Saturday
        </label>
        <label class="checkbox-block">
            <input type="checkbox" name="Sunday" value="green"> Sunday
        </label>
    </div>
</div>





				
			
		

<!-- =============================end of modification================================================ -->


<!-- insert here the missing data if fail -->


<!-- up to here -->


<!-- this is the new code for start time and end time -->



				
				<!-- Text input-->
				<div class="form-group">
				  <label class="col-md-4 control-label" for="start_time">Start time</label>  
				  <div class="col-md-5">
				  <input id="start_time" name="start_time" type="time" placeholder="" class="form-control input-md" required="">
					
				  </div>
				</div>
				
				<!-- Text input-->
				<div class="form-group">
				  <label class="col-md-4 control-label" for="end_time">End time</label>  
				  <div class="col-md-5">
				  <input id="end_time" name="end_time" type="time" placeholder="" class="form-control input-md" required="">
					
				  </div>
				</div>

				
				
				



<!-- end area for the new code for start time and end time-->

<!-- start of sem option -->

<div class="form-group">
    <label class="col-md-4 control-label" for="semester">Select Semester:</label>
    <div class="col-md-5">
        <select class="form-control" name="semester" id="semester">
            <option value="1st Sem">1st Sem</option>
            <option value="2nd Sem">2nd Sem</option>
        </select>
    </div>
</div>

        
<!-- end of sem option -->

       
		<!-- Button -->
				<div class="form-group"  align="right">
				  <label class="col-md-4 control-label" for="submit"></label>
				  <div class="col-md-5">
					<button id="submit" name="insert" class="btn btn-primary"> Set </button>
				  </div>
				</div>
        
        
</fieldset>
			</form>
			
		</div>		
    </div>

    <?php
        include_once("navbar.php");
    ?>
    </body>
	
	
</head>

</html>





