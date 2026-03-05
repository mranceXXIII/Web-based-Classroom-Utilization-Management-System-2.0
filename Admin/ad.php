<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <title>Classroom Utilization Management System</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

        <link rel="stylesheet" href="adminStyle.css">
      <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="bootstrap.min.css">
	    <!----css3---->
        <link rel="stylesheet" href="styleesh.css">

		<!--bootstrap-->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>     
  		<link src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></link>

		<!--google fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
	
	
	   <!--google material icon-->
	   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
      	<link href="https://fonts.googleapis.com/css2?family=Material+Icons"rel="stylesheet">

  </head>
  <body>

  <div class="top-navbar">
		     <div class="xd-topbar">
			     <div class="row">
				     <div class="col-2 col-md-1 col-lg-1 order-2 order-md-1 align-self-center">
					    <div class="xp-menubar">
						    <span class="material-icons text-white"signal_cellular_alt></span>
						</div>
					 </div>
                    </div>
				 <div class="xp-breadcrumbbar text-center">
				    <h4 class="page-title"><img src="images/rsuLogo.png" style="width:40px; border-radius:50%;"><span>	ROMBLON STATE UNIVERSITY</span></h4>
					<ol class="breadcrumb">
					  <li class="breadcrumb-item"><a href="#">ROMBLON STATE UNIVERSITY CAJIDIOCAN CAMPUS</a></li>	
					</ol>
				 </div>
				 
				 
	</div>
</div>
<div class="wrapper">
     
	  <div class="body-overlay"></div>
	 
<!-------sidebar-settings-design------------>
    <div id="sidebar">
	    <div class="sidebar-header">
		   <h3><img src="img/download.png" class="img-fluid"/><span>Admin Menu</span></h3>
		</div>
		  </a>
          <ul>
                                <li class="tablinks" onclick="openTab(event, 'Home')">Home</li>
                                <li class="tablinks" onclick="openTab(event, 'Blocks')">Blocks</li>
                                <li class="tablinks" onclick="openTab(event, 'Schedules')">Schedules</li>
                                <li class="tablinks" onclick="openTab(event, 'Instructor')">Faculty</li>
                                <li class="tablinks" onclick="openTab(event, 'List')">List</li>
                                <li class="tablinks" onclick="logoutConfirmation()"><a href="#" style="text-decoration: none;">Logout</a></li>
                            </ul>
		 
			</li>
		</ul>
	 </div>
</div>


   <div class="cont">
   
    <img  class="logoBack" src="images/rsuLogo.png" alt="hellow to the world">

        <div class="secCont">

          <span style="cursor:pointer" onclick="openNav()">&#9776;</span>

          <div id="myNav" class="overlay" >
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <div class="overlay-content">
                   <div class="hiddenNav">
                           
                    </div>
            </div>
          </div>


              

                    <!-- home section -->
                    <div id="Home" class=" tabcontent Home" id="div1">
                        
                        <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                        <div ><!--former form-->
                            
                            <div class="overflowDiv"><!--this is the table for the home content for overflow-->
                           
                            <iframe src="HomeMainFunc/HomeTableMainFunc.php" frameborder="0" style="width: 100%;height:100%;">
                                <?php
                                    //include"";
                                ?>
                            </iframe>
                            </div>   <!--end for former form-->
                            </div>
                    </div>

                        <!--end for home section -->

                        

                    <!-----     blocks section   -->

                    <div id="Blocks" class="tabcontent blockSec" style="display: none;">
                      <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                        <div><!-- use to be a form-->
                        <div class="overflowDiv">
                            <iframe src="CRUD_ForBlocks/index.php" frameborder="0" style="width: 100%;height:100%;">
                                <?php
                                    //include"";
                                ?>
                            </iframe>


                        </div>
                              
            </div><!-- end of used to be a form-->
                    </div>
                    <!-----    end of blocks section   -->



                    <!-----     schedules section   -->

                    <div id="Schedules" class="tabcontent SchedSec" style="display: none;">
                    <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                    
                      <div><!-- use to be a form-->
                        
                      
                      <div class="overflowDiv"><!--this is the table for the home content for overflow  ____just save for later<img src="images/expand.png" alt="">-->
                      <button class="fulscren" title="Full Screen"><a href="Scheduling_SystemSimple PHP/schedulingsystem/tablelist.php" target="_self"><i class="material-icons" style="font-size:36px">fullscreen</i></a></button>     
                          <iframe src="Scheduling_SystemSimple PHP/schedulingsystem/tablelist.php" frameborder="0" style="width: 100%;height:100%;">    
                                                 
                           </iframe>
                        
                      </div>

                </div><!-- end of used to be a form-->
                  </div>

                    <!-----    end of  schedules section   -->




                    <!--        Instructor section    -->

                    <div id="Instructor" class="tabcontent InstructSec" style="display: none;">
                      <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                        <div><!--former form----->
                          
                        <div class="overflowDiv">
                        <iframe src="CRUD/index.php" frameborder="0" style="width: 100%;height:100%;">                                
                            </iframe>


                        </div>

                    </div>
                    </div>
                    <!--           end of instructor section  -->

                    <!-- List Area                    -->

                    <div id="List" class="tabcontent InstructSec" style="display: none;">
                      <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                        <div><!--former form----->
                          
                        <div class="overflowDiv">
                        <iframe src="Scheduling_SystemSimple PHP\schedulingsystem\list.php" frameborder="0" style="width: 100%;height:100%;">                                
                            </iframe>


                        </div>

                    </div>
                    </div>

                    <!-- end of list area            -->




                     <!--        logout section    -->

                     <!-- <div id="Logout" class="tabcontent LogoutSec" style="display: none;">
                      <h1 style="text-align: center;margin-top: 0;padding-top: 0;">Classroom Utilization Management System</h1>
                        <div>
                         
  
                    </div>
                    </div>  -->
                     <!--      end of login section  -->


            </div> 
        </div>

                
        </div>
    
   </div>
    <footer>

      
    </footer>
   <script src="adminScript.js"></script><!--for the javascript styling-->

  
</body>
</html>