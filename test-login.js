const email = "customer@sarangi.local";
const password = "Customer123!";
fetch("http://localhost:3001/v1/store/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
}).then(r => r.json()).then(console.log).catch(console.error);
