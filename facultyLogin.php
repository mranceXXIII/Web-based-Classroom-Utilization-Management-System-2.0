<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['advisor'];
    $password = $_POST['password'];

    // Connect to MySQL database
            // $servername = "localhost";
            // $dbUsername = "root";
            // $dbPassword = "";
            // $dbName = "room_util_sys_db";
        require_once "config.php";

    $conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    // Prepare and execute the query
    $sql = "SELECT * FROM it_faculty WHERE Name = '$username'";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        if (mysqli_num_rows($result) === 1) {
            $row = mysqli_fetch_assoc($result);
            $hashedPassword = $row['password'];
            // echo "$hashedPassword";
            // echo "$password";

            // Verify the password
            if (password_verify($password, $hashedPassword))  {
                // Set session variables
                $_SESSION['username'] = $username;

                // Redirect to the dashboard or any other page
                header('Location: Faculty/HomeTableMainFunc.php');
                exit();
            } else {
                echo "<script>alert('Invalid username or password!')</script>";  
            }
        } else {
            echo "<script>alert('Invalid username or password!')</script>";
        }
    } else {
        echo "Error: " . mysqli_error($conn);
    }

    // Close the database connection
    mysqli_close($conn);
}
?>

<?php
include('rsuHeader.php');
?>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
   
    <style>
        /* .scholNLogo {
            position: relative;
            width:8%;
            height: 70%;
            margin-right: 10px;
        }

        .scholName {

            position: relative;
            height: 100%;
            background-color: #00AF50;
            border-radius: 1px;
            border: 1px solid #41719C;

            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            border-radius: 2vh;
        } */

        /* body {
            position: relative;
        } */

        body::before {
    content: "";
    background-image: url(educLogo.png);
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    opacity: 0.1;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
}

       
        .container {
            position: relative;
            max-width: 300px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            background-color: rgb(250,248,245);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            top: 60px;
        }

        .form-group {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-control {
            width: 90%;
            padding: 10px;
            border: 2px solid black;
      border-radius: 10px;
            /* border: 1px solid #ccc;
            border-radius: 4px; */
            box-sizing:content-box;
        }

        .password-input {
            width: 84%;
            box-sizing:content-box;
        }

        input[type="submit"] {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
        }



        .password-container {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #777;
  }

  .password-toggle:hover {
    color: #333;
  }

  .password-input {
    padding-right: 30px; /* Create space for the eye icon */
  }

 
    </style>
</head>

<body>
    <!-- <div class="scholNameCont">
        <div class="scholName">
            <img class="scholNLogo" src="rsuLogo.png">
            <h1>Romblon State University-Cajidiocan Campus</h1>
        </div>
    </div> -->
        <div class="container">
            <form action="facultyLogin.php" method="POST">
                <h2>Faculty Login</h2>
                <div class="form-group">
                    <label for="advisor">Advisor</label>
                    <select name="advisor" id="advisor" class="form-control">
                        <?php
                        require_once "config.php";
                        $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                        if (!$connection) {
                            die('Connection failed: ' . mysqli_connect_error());
                        }

                        $query = "SELECT Name FROM it_faculty ORDER BY Name";
                        $result = mysqli_query($connection, $query);
                        if (!$result) {
                            die('Query failed: ' . mysqli_error($connection));
                        }

                        while ($row = mysqli_fetch_assoc($result)) {
                            echo '<option value="' . $row['Name'] . '">' . $row['Name'] . '</option>';
                        }

                        mysqli_close($connection);
                        ?>
                    </select>
                </div>

                <div class="form-group">
                <label for="password">Password</label>
                <div class="password-container">
                    <input type="password" name="password" id="password" class="form-control password-input">
                    <input type="checkbox" onclick="myFunction()">Show Password <br><br>
                </div>
                </div>

                <input type="submit" value="Submit">
                <a href="facultyRegister.php">Register</a>
            </form>
        </div>


        <script>
   function myFunction() {
  var x = document.getElementById("password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}
</script>


<?php
include('footer.php');
?>
</body>

</html>


