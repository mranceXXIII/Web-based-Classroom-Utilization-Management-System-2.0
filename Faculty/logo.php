<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"> ayaw pag hilabti masisira buhay mo -->
<style>

   body {
  margin: 0;
  padding: 0;
}

.lgout {
  position: absolute;
  top: 20%;
  right: 2%;
  font-size: 200%;
}

.green-bg {
	  width:100%;
	  z-index:9;
	  position:relative;
	  padding: 15px 30px;
	  background-color:  #173370;
}
.green-bg .page-title {
    font-size: 20px;
    color: #ffffff;
    margin-bottom: 0;
    margin-top: 0;
}
  
  .breadcrumb {
    display: inline-flex;
    background-color: transparent;
    margin: 0;
    padding: 10px 0 0;
}
.green-bg .breadcrumb .breadcrumb-item a {
	  color: #f9fffc;
		
}
.breadcrumb-item.active {
	color: #c3d6cd;

}
.green-bg .lgout {
  background-color: transparent;
  position: absolute;
  top: 105%;
  right: 3%;
  font-size: 200%;
}

.scholName {
  display: flex;
  align-items: center;
  padding: 1% 2%;
}

.scholNLogo {

  width: 8%;
  margin-right: 5px;
}


.titleSys {
  background-color: #165aec;
  text-align: center;
}

.titleSys h4 {
  margin: 50;
   font-size: 2.4vw; 
   color: white;
  
}


.scholName h1 {
  margin: 0;
  font-size: 3.7vw;
  color: white;
  height: 3vh;
  padding-bottom: 7%;
  padding-top: 0;
}

@media only screen and (max-width:800px){
        .lgout {
          top: 0.6%;
        font-size: 200%;
      }

         


          }
       

@media only screen and (max-width: 400px){
           
      .scholNLogo {
      height: 5%;
    
    }
            


          }
       




</style>
</head>
<body>
  
  <div class="green-bg text-center">
				    <h4 class="page-title"><img src="rsuLogo.png" style="width:80px; border-radius:50%;"></h4>
					<ol class="breadcrumb">
					  <li class="breadcrumb-item"><a>ROMBLON STATE UNIVERSITY CAJIDIOCAN CAMPUS</a></li>	
					</ol>
    
          <a href="#"   title="Logout" onclick="logoutConfirmation()"><i id='logoutIcon' class="fas fa-sign-out-alt lgout" style="color: red;"><span>LOGOUT</span></i></a>

  </div>


<div class="titleSys">
  <h4>Education Department Classroom Utilization Management System </h4>
</div>




<script>

function logoutConfirmation() {
  var result = confirm("Are you sure you want to log out?");
  if (result) {
    // The user clicked "OK" (Yes) - Add your logout logic here
    // alert("Logging out..."); // Optional alert for demonstration purposes
    // Perform the logout action, e.g., redirect to logout.php or clear session data
    window.location.href = "../index.php"; // Replace with the URL for logout action
  } else {
    // The user clicked "Cancel" (No) - No specific action is taken in this case
  }
}
</script>

</body>
</html>
