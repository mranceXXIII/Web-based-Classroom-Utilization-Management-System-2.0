<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <title link rel="icon" href="rsuLogo.png" type="image/x-icon" >Education Department Classroom Utilization Management System</title>
	    <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="css/bootstrap.min.css">
	    <!----css3---->
        <link rel="stylesheet" href="css/styleesh.css">
		<link rel="stylesheet" href="adminStyle.css">
		
		<!--bootstrap-->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>     
  		<link src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></link>
		<!--google fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
	   <!--google material icon-->
	   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
      	<link href="https://fonts.googleapis.com/css2?family=Material+Icons"rel="stylesheet">
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  </head>
  <body>
  


<div class="wrapper">
     
	  <div class="body-overlay"></div>
	 
	 <!-------sidebar--design------------>
	 
	 <div id="sidebar">
	    <div class="sidebar-header">
		   <h3><img src="img/download.png" class="img-fluid"/><br>Admin Dashboard</h3>
		</div>
		<ul class="list-unstyled component m-0">
		  <li class="dropdown">
		  <a href="#homeSubmenu1" data-toggle="collapse" aria-expanded="false" 
		  class="dropdown-toggle">
		  <i class="material-icons">settings</i>Admin Menu
		  </a>
		  <ul class="collapse list-unstyled menu" id="homeSubmenu1">
		    
                                <li><a class="btn" data-toggle="modal" href onclick="openTab(event, 'Home')">Home</a></li>
                                <li><a class="btn" data-toggle="modal" href onclick="openTab(event, 'Blocks')">Blocks</a></li>
                                <li><a class="btn" data-toggle="modal" href onclick="openTab(event, 'Schedules')">Schedules</a></li>
                                <li><a class="btn" data-toggle="modal" href onclick="openTab(event, 'Instructor')">Faculty</a></li>
                                <li><a class="btn" data-toggle="modal" href onclick="openTab(event, 'List')">List</a></li>
                                <li onclick="logoutConfirmation()"><a class="btn" data-toggle="modal" href="#" style="text-decoration: none;">Logout</a></li>
                            
		  </ul>
		  </li>
		</ul>
	 </div>
	 
   <!-------sidebar--design- close----------->
   
   
   
      <!-------page-content start----------->
   
      <div id="content">
	     
		  <!------top-navbar-start-----------> 
		     
		  <div class="top-navbar">
		     <div class="xd-topbar">
			     <div class="row">
				     <div class="col-2 col-md-1 col-lg-1 order-2 order-md-1 align-self-center">
					    <div class="xp-menubar">
              <span class="material-icons text-white"><img src="img/more.png" class="img-fluid"/></span>
						</div>
					 </div>
					 
				 </div>
				 
				 <div class="xp-breadcrumbbar text-center">
				    <h4 class="page-title"><img src="images/rsuLogo.png" style="width:80px; border-radius:50%;"></h4>
					<ol class="breadcrumb">
					  <li class="breadcrumb-item"><a>ROMBLON STATE UNIVERSITY CAJIDIOCAN CAMPUS</a></li>	
					</ol>
				 </div>
				 
				 
			 </div>
		  </div>
		  <!------top-navbar-end-----------> 
		  
		  
		   <!------main-content-start-----------> 
		     
		      <div class="main-content">
			     <div class="row">
				    <div class="col-md-12">

					   <div class="table-wrapper"> 
					   <div class="table-title">
					     <div class="row">
						     <div class="col-sm-6 p-0 flex justify-content-lg-start justify-content-center">
							    <h2 class="ml-lg-2">Education Department Classroom Utilization Management System</h2>
							 </div>
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
                     
                        <div><!--former form----->
                          
                        <div class="overflowDiv">
                        <button class="fulscren" title="Full Screen"><a href="Scheduling_SystemSimple PHP/schedulingsystem/list.php" target="_self"><i class="material-icons" style="font-size:36px">fullscreen</i></a></button>
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

   <script src="adminScript.js"></script><!--for the javascript styling-->
		    <!------main-content-end-----------> 
		  
		 
		 
		 <!----footer-design------------->
		 
		 <footer class="footer">
		    <div class="container-fluid">
			   <div class="footer-in">
			      <p class="mb-0">Serving with Honor and Excellence!</p>
			   </div>
			</div>
		 </footer>

	  </div>
   
    </div>
      </div>
</div>

<!-------complete html----------->

     <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
   <script src="js/jquery-3.3.1.slim.min.js"></script>
   <script src="js/popper.min.js"></script>
   <script src="js/bootstrap.min.js"></script>
   <script src="js/jquery-3.3.1.min.js"></script>
  
  
  <script type="text/javascript">
       $(document).ready(function(){
	      $(".xp-menubar").on('click',function(){
		    $("#sidebar").toggleClass('active');
			$("#content").toggleClass('active');
		  });
		  
		  $('.xp-menubar,.body-overlay').on('click',function(){
		     $("#sidebar,.body-overlay").toggleClass('show-nav');
		  });
		  
	   });
  </script>

  </body>
  
  </html>