const API = "/api";
function getToken(){ return localStorage.getItem("token"); }
async function api(path, options={}) {
  const headers = {"Content-Type":"application/json", ...(options.headers||{})};
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, {...options, headers});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
function money(v){return `₹${Number(v).toFixed(2)}`}
function esc(s){return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
