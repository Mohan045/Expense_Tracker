const http = require('http');
const fs = require('fs');

function readEmployees() {
 return JSON.parse(fs.readFileSync('employees.json','utf8'));
}

function saveEmployees(employees) {
 fs.writeFileSync('employees.json', JSON.stringify(employees,null,2));
}

const server = http.createServer((req,res)=>{
 const {method,url} = req;

 if(url === '/') {
  res.writeHead(200, {'Content-Type':'text/html'});
  return res.end(fs.readFileSync('index.html','utf8'));
 }

 if(url === '/script.js') {
  res.writeHead(200, {'Content-Type':'application/javascript'});
  return res.end(fs.readFileSync('script.js','utf8'));
 }

 if(method === 'GET' && url === '/employees') {
  res.writeHead(200, {'Content-Type':'application/json'});
  return res.end(JSON.stringify(readEmployees()));
 }

 if(method === 'POST' && url === '/employees') {
  let body='';
  req.on('data', c => body += c);
  req.on('end', ()=>{
   const employees = readEmployees();
   const emp = JSON.parse(body);
   emp.id = employees.length ? Math.max(...employees.map(e=>e.id))+1 : 1;
   employees.push(emp);
   saveEmployees(employees);
   res.end(JSON.stringify(emp));
  });
  return;
 }

 if(method === 'PUT' && url.startsWith('/employees/')) {
  let body='';
  const id = parseInt(url.split('/')[2]);
  req.on('data', c => body += c);
  req.on('end', ()=>{
   const updated = JSON.parse(body);
   const employees = readEmployees();
   const emp = employees.find(e=>e.id===id);
   if(emp){
    emp.name = updated.name;
    emp.department = updated.department;
    emp.salary = updated.salary;
   }
   saveEmployees(employees);
   res.end(JSON.stringify({message:'Updated'}));
  });
  return;
 }

 if(method === 'DELETE' && url.startsWith('/employees/')) {
  const id = parseInt(url.split('/')[2]);
  saveEmployees(readEmployees().filter(e=>e.id!==id));
  return res.end(JSON.stringify({message:'Deleted'}));
 }
});

server.listen(3000, ()=>console.log('http://localhost:3000'));