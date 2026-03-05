<!DOCTYPE html>
<html>
<head>
    <title>Upload and Save Data</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
        }

        h1 {
            text-align: center;
            color: #333;
        }

        .upload-form {
            max-width: 400px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .upload-form label {
            display: block;
            margin-bottom: 10px;
        }

        .upload-form input[type="file"] {
            display: block;
            margin-bottom: 20px;
        }

        .upload-form input[type="submit"] {
            background-color: #007BFF;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }

        .upload-form input[type="submit"]:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="upload-form">
        <h1>Upload a CSV file</h1>
        <p>Note: Names must be transpose or in horizontal format before uploading.</p>
        <form action="processCSV.php" method="post" enctype="multipart/form-data">
            <label for="fileToUpload">Select a CSV file:</label>
            <input type="file" name="fileToUpload" id="fileToUpload">
            <input type="submit" value="Upload File" name="submit">
        </form>
    </div>
</body>
</html>
