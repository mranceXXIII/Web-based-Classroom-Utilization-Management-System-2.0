<?php 
 include_once("header.php");
?>
<style>
.contNav {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
}

.navbar-horizontal {
    display: flex;
    justify-content: center;
    background-color: #f8f9fa;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.navbar-horizontal .nav > li {
    display: inline-block;
    margin: 0 10px;
}

.navbar-horizontal .nav > li > a {
    color: #333;
    border-radius: 5px;
    padding: 10px 15px;
}

.navbar-horizontal .nav > li > a:hover,
.navbar-horizontal .nav > li > a:focus {
    background-color: #e9ecef;
    color: #333;
}





</style>
<html>
<head>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>

<body>

<div class="container contNav">
    <nav class="navbar navbar-horizontal">
        <ul class="nav navbar-nav">
         <li><a href="HomeTableMainFunc.php"><span class="glyphicon glyphicon-home"></span> Back</a></li>
            <!-- <li><a href="tablelist.php"><span class="glyphicon glyphicon-calendar"></span> Schedule</a></li>
            <li><a href="home.php"><span class="glyphicon glyphicon-plus-sign"></span> Add Schedule</a></li>
            <li><a href="addsubject.php"><span class="glyphicon glyphicon-plus-sign"></span> Subjects</a></li>
            <li><a href="addfaculty.php"><span class="glyphicon glyphicon-plus-sign"></span> Faculty</a></li>  -->
            <!-- <li><a href="addcourse.php"><span class="glyphicon glyphicon-plus-sign"></span> Course</a></li> -->
            <!-- <li><a href="addroom.php"><span class="glyphicon glyphicon-asterisk"></span> Room</a></li> -->
            <!-- <li><a href="addtime.php"><span class="glyphicon glyphicon-time"></span> Time</a></li> -->
            <!-- <li><a href="list.php"><span class="glyphicon glyphicon-list"></span> List</a></li> -->
           
            <!-- <li><a href="Index.php"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li> -->
        </ul>
    </nav>
   
</div>



</body>
</html>





