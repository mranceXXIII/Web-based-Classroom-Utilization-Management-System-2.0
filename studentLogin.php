
<?php

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $username = $_POST["username"];
    $password = $_POST["password"];

    // Database connection parameters
            // $servername = "localhost";
            // $username_db = "root";
            // $password_db = "";
            // $dbname = "room_util_sys_db";
     require_once "config.php";
     //       DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME
    // Create a new PDO instance
    // $pdo = new PDO("mysql:host=DB_SERVER;dbname=DB_NAME", DB_USERNAME, DB_PASSWORD);
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    
    // Prepare and execute the SELECT statement
    $stmt = $pdo->prepare("SELECT * FROM student WHERE student_name = ?");
    $stmt->execute([$username]);

    // Check if a matching user is found
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify the password
        if (password_verify($password, $user['password'])) {
            // Redirect to the desired page after successful login
            header("Location: Students/HomeTableMainFunc.php");
            exit();
        } else {
            echo "<script>alert('Failed Login')</script>";
        }
    } else {
        // echo "User not found.";
        echo "<script>alert('User not found.')</script>";  
    }

    // Close the database connection
    $pdo = null;
}

?>

<?php
include('rsuHeader.php');
?>

<!DOCTYPE html>
<html>

<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>
        /* .scholNLogo {
            position: relative;
            width: 8%;
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
        }

        body {
            position: relative;
        } */

            /* body::before {
                content: "";
                background-image: url(rsuLogo.png);
                width: 90%;
                background-repeat: no-repeat;
                background-size: contain;
                background-position: center;
                opacity: 0.1;
                position: absolute;
                top: 5%;
                left: 4.5%;
                right: 0;
                bottom: 0;
            } */

            .login-container {
    position: relative;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    margin: 100px auto;
    max-width: 300px;
    padding: 10px;
    top: -80px;
}

h2 {
    text-align: center;
}

form {
    position: relative;
    display: flex;
    flex-direction: column;
}

input[type="text"],
input[type="password"] {
    width: 90%;
    margin-bottom: 10px;
    padding: 10px;
    border: 2px solid black;
    border-radius: 10px;
}

button {
    background-color: green;
    border: none;
    color: white;
    cursor: pointer;
    padding: 10px;
}

button:hover {
    background-color: black;
}

.error {
    color: red;
    margin-top: 10px;
    text-align: center;
}

.c-button {
    background-color: blue;
}

.password-container {
    position: relative;
    width: 100%;
}

.password-toggle {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #777;
    font-size: 16px; /* Adjust the font size as needed */
}

.password-toggle:hover {
    color: #333;
}
input[type="password"] {
    width: calc(100% - 30px); /* Subtract the space for the toggle icon */
    padding-right: 10px; /* Adjust padding for better appearance */
}

    </style>
</head>

<body>
    <!-- <div class="scholNameCont">
        <div class="scholName">
            <img class="scholNLogo" src="rsuLogo.png" alt="RSU Logo">
            <h1>Romblon State University-Cajidiocan Campus</h1>
        </div>
    </div> -->
    <div class="login-container">
        <h2>Student Login</h2>
        <form action="studentLogin.php" method="POST">
        <input type="text" name="username" placeholder="Username" required>

        <div class="password-container">
            <input type="password" name="password" placeholder="Password" required id="passwordField"><br>
            <input type="checkbox" onclick="myFunction()">Show Password <br><br>
        </div>

        <button type="submit">Login</button>
        <br>
        <button type="button" onclick="location.href='student_register.php'" class="c-button">Create Account</button>
        </form>
    </div>


    <script>
  function myFunction() {
  var x = document.getElementById("passwordField");
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

</html> 

