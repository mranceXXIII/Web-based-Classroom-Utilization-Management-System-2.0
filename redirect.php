<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $option = $_POST['option'];

    if ($option === 'option1') {
        header("Location: adminLogin.php");
        exit();
    } elseif ($option === 'option2') {
        header("Location: facultyLogin.php");
        exit();
    } elseif ($option === 'option3') {
        header("Location: studentLogin.php");
        exit();
    }
}
?>
