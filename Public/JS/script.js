const navbutton = document.querySelector(".icon");
const navlist = document.querySelector(".navmenu");

navbutton.addEventListener("click", function (e) {
  let value = navlist.classList.contains("navbar-collapse");
  //  if(value){

  //  }

  console.log(value);
  if (value) {
    navlist.classList.remove("navbar-collapse");
  } else {
    navlist.classList.add("navbar-collapse");
  }
});
