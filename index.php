
<?php
include('rsuHeader.php');
?>


<html>

<head>
    <title>Options</title>
    <style>

        form {
            
            
            position: relative;
            background-color: #FFFFFF;
            border-top: 6px solid #3D9B8A;
            font-family: Poppins, sans-serif;
            box-shadow: 0 4px 14px rgba(21, 36, 31, 0.18);
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
            font-weight: 600;
            accent-color: #3D9B8A;
           
          
        }

        input[type="submit"] {
            background-color: #3D9B8A;
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
            background-color: #2E7A6C;
        }
    </style>
</head>

<body>
   

    <form method="POST" action="redirect.php">
        <h2 style="color: #1F5A50; margin-top: 0;">Select an option</h2>
        <div class="radioCont">
        <input type="radio" id="adminRadio" name="option" value="option1" required><label for="adminRadio">Admin</label><br>
        <input type="radio" id="facRadio" name="option" value="option2" required><label for="facRadio">Faculty</label><br>
        <input type="radio" id="studRadio" name="option" value="option3" required><label for="studRadio">Student</label><br><br>
        </div>
        <input type="submit" value="Submit">
    </form>

    


</body>

<?php
include('footer.php');
?>

</html>