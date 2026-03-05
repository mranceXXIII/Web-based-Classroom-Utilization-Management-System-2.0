setInterval(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'heartbeat.php', true);
    xhr.send();
  }, 30000);
  