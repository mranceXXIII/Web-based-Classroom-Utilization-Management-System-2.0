<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    // Database connection settings
        // $servername = "localhost";  // Replace with your MySQL server name
        // $username_db = "root";      // Replace with your MySQL username
        // $password_db = "";  // Replace with your MySQL password
        // $dbname = "room_util_sys_db";  // Replace with your MySQL database name

        require_once "config.php";
    // Create connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare and execute the select statement with a parameterized query
    $stmt = $conn->prepare("SELECT * FROM admin_register WHERE name = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result) {
        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            $hashedPassword = $row['password'];

            // Verify the password
            if (password_verify($password, $hashedPassword)) {
                // Set session variables
                $_SESSION['username'] = $username;

                // Redirect to the dashboard or any other page
                header('Location: Admin/admin.php');
                exit();
            } else {
                // echo "Invalid username or password!";
                echo "<script>alert('Invalid username or password!')</script>";  
            }
        } else {
            // echo "Invalid username or password!";
            echo "<script>alert('Invalid username or password!')</script>";  
        }
    } else {
        echo "Error: " . $conn->error;
    }

    // Close the prepared statement and database connection
    $stmt->close();
    $conn->close();
}
?>



<?php
include('rsuHeader.php');
?>
<!DOCTYPE html>
<html>

<head>
<link rel="icon" href="rsuLogo.png" type="image/x-icon"/>   
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">


<title>Classroom Utilization Management System</title>
  <link rel="stylesheet" type="text/css" href="style.css">
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
    } */

    /* body {
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
      top: 20%;
      left: 4.5%;
      right: 0;
      bottom: 0;

    } */

    .login-container {
      position: relative;
      background-color: #ffffff;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      /* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); */
      margin: 100px auto;
      max-width: 270px;
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
  }

  .password-toggle {
    position: absolute;
    top: 40%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
  }
  #passwordField {
    width: 90%; /* Set the desired width */
  }
  </style>
</head>

<body>
  <!-- <div class="scholNameCont">
    <div class="scholName">
      <img class="scholNLogo" src="rsuLogo.png">
      <h1>Romblon State University-Cajidiocan Campus</h1>
    </div> -->

  </div>
  <div class="login-container">
    <h2>ADMIN Login</h2>
    <form action="adminLogin.php" method="POST">
      <input type="text" name="username" placeholder="Username" required>

      <div class="password-container">
  <input type="password" name="password" placeholder="Password" required id="passwordField">
  <i class="password-toggle fas fa-eye" onclick="togglePasswordVisibility()"></i>
    </div>

      
      <button type="submit">Login</button>
      <br>
      <button type="button" onclick="location.href='adminRegister.php'" class="c-button">Create Account</button>
    </form>
  </div>

  <script>
  function togglePasswordVisibility() {
    const passwordField = document.getElementById('passwordField');
    const passwordToggle = document.querySelector('.password-toggle');

    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      passwordToggle.classList.remove('fa-eye');
      passwordToggle.classList.add('fa-eye-slash');
    } else {
      passwordField.type = 'password';
      passwordToggle.classList.remove('fa-eye-slash');
      passwordToggle.classList.add('fa-eye');
    }
  }
</script>


<?php
include('footer.php');
?>

</body>

</html>


