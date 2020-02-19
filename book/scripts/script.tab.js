function openCode(evt, fileName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    if (tabcontent[i].className.split(' ')[1] === evt.currentTarget.parentElement.className.split(' ')[1]) {
      tabcontent[i].className = tabcontent[i].className.replace(/ active/gi, '');
    }
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(/ active/gi, '');
  }
  document.getElementById(fileName).className += " active";
  evt.currentTarget.className += " active";
}