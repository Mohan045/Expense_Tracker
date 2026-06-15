var editId=null;
window.onload=function(){loadEmployees();};
function loadEmployees(){fetch('/employees').then(r=>r.json()).then(showEmployees);}
function showEmployees(employees){
let rows='';
employees.forEach(e=>{
rows+=`<tr><td>${e.id}</td><td>${e.name}</td><td>${e.department}</td><td>${e.salary}</td>
<td><button class="edit-btn" onclick="editEmployee(${e.id})">Edit</button></td>
<td><button class="delete-btn" onclick="deleteEmployee(${e.id})">Delete</button></td></tr>`;
});
document.getElementById('employee-table').innerHTML=rows;
}
function saveEmployee(){
const employee={name:name.value,department:department.value,salary:Number(salary.value)};
const method=editId===null?'POST':'PUT';
const url=editId===null?'/employees':'/employees/'+editId;
fetch(url,{method:method,headers:{'Content-Type':'application/json'},body:JSON.stringify(employee)})
.then(()=>{loadEmployees();editId===null?clearForm():cancelEdit();});
}
function editEmployee(id){
fetch('/employees').then(r=>r.json()).then(data=>{
const e=data.find(x=>x.id===id);
name.value=e.name;department.value=e.department;salary.value=e.salary;});
editId=id;document.getElementById('form-heading').innerText='Edit Employee';
document.getElementById('cancel-btn').style.display='inline';
}
function deleteEmployee(id){fetch('/employees/'+id,{method:'DELETE'}).then(loadEmployees);}
function cancelEdit(){editId=null;clearForm();document.getElementById('form-heading').innerText='Add Employee';document.getElementById('cancel-btn').style.display='none';}
function clearForm(){name.value='';department.value='';salary.value='';}