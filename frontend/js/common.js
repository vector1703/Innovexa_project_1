document.addEventListener("DOMContentLoaded", async ()=>{
  const user = localStorage.getItem("user");
  const area = document.querySelector("#authArea");
  if(area){
    area.innerHTML = user
      ? `<a href="orders.html">My Orders</a><a href="#" onclick="logout()">Logout</a>`
      : `<a href="login.html">Login</a><a class="btn" href="register.html">Register</a>`;
  }
  const count = document.querySelector("#cartCount");
  if(count && localStorage.getItem("token")){
    try{ const c=await api("/cart"); count.textContent=c.items.reduce((a,i)=>a+i.quantity,0); }catch{}
  }
});
function logout(){localStorage.clear();location.href="index.html";}
