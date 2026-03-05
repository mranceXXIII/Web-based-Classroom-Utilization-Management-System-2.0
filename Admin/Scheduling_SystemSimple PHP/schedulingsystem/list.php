<?php
  $path = $_SERVER['DOCUMENT_ROOT'];
   $path .= "header.php";
   include_once("header.php");
   include_once("navbar.php");
?>
<html>
<head>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>


<style>
body {
	background-color: white;
}

</style>
</head>
<body>

<div class="container-fluid table" style="position: sticky; top: 2px; z-index: 10;">
        <div class="row">
            <div class="col-md-12">
                <div class="search-wrapper d-flex justify-content-end align-items-center">
                    <div class="form-group mb-0 mr-2">
                        <input type="text" class="form-control" id="search" placeholder="Search">
                    </div>
                    <button type="button" class="btn btn-primary mr-2" id="searchBtn">Search</button>
                    <button type="button" class="btn btn-secondary" id="refreshBtn">Refresh</button>
                </div>
            </div>
        </div>
    </div>


<button class="convert-button" data-table-id="tableroomlist">Convert Table  to CSV</button>
<div align="center">

			<legend>List of rooms</legend></fieldset>
			<?php
				 include_once("roomlist.php");
			?>
			<br>
			<br>
			<br>
			<br>
			<button class="convert-button" data-table-id="tablefaclist">Convert Table  to CSV</button>
            <div align="center">
			
            <legend>List of Faculties</legend></fieldset>
			<?php
				include_once("faclist.php");
			?>
			<br>
			<br>
			<br>
			<br>
			</div>			
			<!-- <div align="center">
			<legend>List of Courses</legend></fieldset>
			<?php 
             // include_once("corlist.php");
			?>
			<br>
			<br>
			<br>
			<br> -->
			<button class="convert-button" data-table-id="tablesublist">Convert Table  to CSV</button>
			<div align="center">
			<legend>List of Subjects</legend></fieldset>
			<?php 
			  include_once("sublist.php");
			?>
			<br>
			<br>
			<br>
			<br>
			
			<div align="center">
			<legend>List of class time</legend></fieldset>
			<?php
				include_once("timelist.php");
			?>


			
			

			<script>

// for search button

document.addEventListener('DOMContentLoaded', function() {
            function searchInTables(keyword) {
                const tables = document.querySelectorAll('table');
            
                tables.forEach(table => {
                    const rows = table.querySelectorAll('tbody tr');
            
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
            
                        let rowVisible = false;
                        cells.forEach(cell => {
                            if (cell.textContent.includes(keyword)) {
                                rowVisible = true;
                            }
                        });
            
                        if (rowVisible) {
                            row.style.display = ''; // Show the row
                        } else {
                            row.style.display = 'none'; // Hide the row
                        }
                    });
                });
            }
            
            document.getElementById('searchBtn').addEventListener('click', function() {
                const searchInput = document.getElementById('search');
                const keyword = searchInput.value.trim();
            
                if (keyword !== '') {
                    searchInTables(keyword);
                }
            });
            
            document.getElementById('refreshBtn').addEventListener('click', function() {
                const rows = document.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    row.style.display = ''; // Show all rows
                });
            });
        });



// for csv
	document.querySelectorAll(".convert-button").forEach(function(button) {
  button.addEventListener("click", function() {
    const tableId = button.getAttribute("data-table-id");
    const table = document.getElementById(tableId);

    let csv = "";

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const rowData = [];

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        const cellData = cell.textContent;
        rowData.push(`"${cellData}"`);
      }

      csv += rowData.join(",") + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableId}_data.csv`;
    link.click();
  });
});



</script>
</body>
</html>
<?php
   include_once("footer.php");
   include_once("navbar.php");
?>