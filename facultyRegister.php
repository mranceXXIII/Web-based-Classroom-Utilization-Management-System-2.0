
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Retrieve form data
  $name = $_POST["name"];
  $password = $_POST["password"];

  // Hash the password
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

  // Perform any necessary processing with the form data
  // ...

  // Save the hashed password in the database
  // Assuming you have a database connection established
      // $servername = "localhost";
      // $dbUsername = "root";
      // $dbPassword = "";
      // $dbName = "room_util_sys_db";
      require_once "config.php";
    //  DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME
  // $pdo = new PDO("mysql:host=DB_SERVER;dbname=DB_NAME", DB_USERNAME, DB_PASSWORD);
  $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // Check if the password already exists or is empty in the table
  $checkQuery = "SELECT password FROM it_faculty WHERE Name = ?";
  $stmt = $pdo->prepare($checkQuery);
  $stmt->execute([$name]);
  $existingPassword = $stmt->fetchColumn();

  if ($existingPassword !== null && $existingPassword !== "") {
      echo "Password already exists in the table. Please choose a different password.";
      header("Location: facultyRegister.php");
      exit; // Stop further execution
  }

  // Update the password in the database
  $updateQuery = "UPDATE it_faculty SET password = ? WHERE Name = ? AND (password IS NULL OR password = '')";
  $updateStmt = $pdo->prepare($updateQuery);
  $updateStmt->execute([$hashedPassword, $name]);

  if ($updateStmt->rowCount() > 0) {
      echo "Password updated successfully!";
      header("Location: facultyLogin.php");
      exit;
  } else {
      echo "Error updating password.";
  }
}


?>


<?php
include('rsuHeader.php');
?>


<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
     body {
      font-family: Poppins, sans-serif;
      /* background-color: #f5f5f5;
         padding: 20px;  */
         
    } 

    h2 {
      text-align: center;
    }

    form {
     position: relative;
      max-width: 320px;
      margin: 0 auto;
      margin-top: 2%;
      background-color: #FFFFFF;
      padding: 20px;
      border-radius: 8px;
      border-top: 6px solid #3D9B8A;
      box-shadow: 0 4px 14px rgba(21, 36, 31, 0.18);
    }

    label {
      display: block;
      margin-bottom: 10px;
    }

    button {
            background-color: #EAF4F1;
            color: #1F5A50;
            border: 1px solid #3D9B8A;
            color: #fff;
            border: none;
            padding: 10px 20px;
            margin-top: 10px;
            border-radius: 4px;
            cursor: pointer;
        }

    select,
    input[type="password"],input[type="text"]{
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border: 1.5px solid #9FC9BC;
      border-radius: 10px;
      /* border: 1px solid #ccc; */
      /* border-radius: 4px; */
      box-sizing: border-box;
    }

    input[type="submit"] {
      background-color: #3D9B8A;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    input[type="submit"]:hover {
      background-color: #2E7A6C;
    }


    .password-toggle {
  float: right;
   
}

.password-toggle:hover {
    color: #333;
}
  </style>
</head>
<body>


<form action="facultyRegister.php" method="POST">
<h2 style="color: #1F5A50;">Faculty Registration Form</h2>

  <label for="name">Name:</label>
                <select name="name" id="name" class="form-control">
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
                <label for="password">Password:</label>
  <input type="password" id="password" name="password" required>
  <input type="checkbox" onclick="myFunction()">Show Password <br><br>

  <input type="submit" value="Submit">
  <a href="facultyLogin.php">
          <button type="button">Back</button>
        </a>
</form>

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

