
<?php
include('rsuHeader.php');
?>


<html>

<head>
    <title>Options</title>
    <style>

        form {
            
            
            position: relative;
            background-color: rgb(250,248,245,0.8);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            width: 300px;
            padding: 20px;
            border-radius: 5px;
            margin: 0 auto;
            margin-top: 2%;
            text-align: center;
            font-size: 27px;
            /* width: 80%; */
            /* Center align the form content */
        }

        input[type="radio"] {
            margin-bottom: 10px;
            font-weight: bold;
           
          
        }

        input[type="submit"] {
            background-color: green;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 5px;
        }
        .radioCont{         
         text-align: left;
         margin: 0 30%;

        }
        input[type="submit"]:hover {
            background-color: darkgreen;
        }
    </style>
</head>

<body>
   

    <form method="POST" action="redirect.php">
        <h2>Select an option</h2>
        <div class="radioCont">
        <input type="radio" id="adminRadio" name="option" value="option1" required><label for="adminRadio">Admin</label><br>
        <input type="radio" id="facRadio" name="option" value="option2" required><label for="facRadio">Faculty</label><br>
        <input type="radio" id="studRadio" name="option" value="option3" required>Student<br><br>
        </div>
        <input type="submit" value="Submit">
    </form>

    


</body>

<?php
include('footer.php');
?>

</html>