

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="rsuLogo.png" type="image/x-icon"/>   

<title>Classroom Utilization Management System</title>
    <style>
        html{
            padding: 0;
        }
body {
   /* padding: 0; */
        position: relative;
            
        margin: 0;
    background-color: #EAF4F1;
    font-family: Poppins, sans-serif;
    

}
.scholNLogo {
            position: relative;
            width:8%;
            height: 100%;
            margin-right: 10px;
            
        }

        .scholName {

            position: relative;
            /* height: 100%; */
            background-color: #3D9B8A;
            /* background-color: #00AF50; */
            /* border-radius: 1px; */
            /* border: 1px solid #41719C; */
           
            
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding-left: 4vw;
            /* border-radius: 2vh; */
        }
        .scholName h1{
            font-size: 2.4vw;
            margin: 0;
            letter-spacing: 0.5px;
            
        }

        .scholTag {
            position: absolute;
            right: 2%;
            bottom: 6%;
            font-size: 1vw;
            color: #EDC94F;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .scholNLogo {
            background-color: #FFFFFF;
            border-radius: 50%;
            padding: 2px;
        }
        @media only screen and (max-width: 600px){
            .scholTag { display: none; }
            .scholName h1 { font-size: 5vw; }
        }
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


    </style>
</head>
<body>
    
<div class="scholNameCont">
        <div class="scholName">
            <img class="scholNLogo" src="rsuLogo.png">
            <h1>Romblon State University Cajidiocan Campus</h1>
            <span class="scholTag">The Green University</span>
        </div>



</body>


</html>