
function renderSuppliers() {
  const list=Store.get("suppliers");
  return `<p class="page-intro">Keep supplier contact information organized in one place.</p>
  <div class="panel"><h2 id="supplierTitle">Add Supplier</h2><br>
  <form id="supplierForm" class="form-grid">
    <input type="hidden" name="id">
    <div class="field"><label>Supplier Name *</label><input name="name" required></div>
    <div class="field"><label>Company Name *</label><input name="company" required></div>
    <div class="field"><label>Phone Number *</label><input name="phone" required pattern="[0-9+() -]{7,18}"></div>
    <div class="field"><label>Email Address *</label><input name="email" type="email" required></div>
    <div class="field full"><label>Address *</label><textarea name="address" required></textarea></div>
    <div class="form-actions"><button class="btn btn-primary">Save Supplier</button><button class="btn btn-outline" type="reset">Clear</button></div>
  </form></div>
  <div class="panel"><div class="panel-heading"><h2>Suppliers (${list.length})</h2><input class="search" id="supplierSearch" placeholder="Search suppliers..."></div>
  <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead><tbody id="suppliersBody">${supplierRows(list)}</tbody></table></div></div>`;
}

function supplierRows(list) {
  if(!list.length)return '<tr><td colspan="6" class="empty">No matching suppliers.</td></tr>';
  return list.map(s=>`<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.company)}</td><td>${escapeHTML(s.phone)}</td><td>${escapeHTML(s.email)}</td><td>${escapeHTML(s.address)}</td><td><div class="toolbar"><button class="btn btn-secondary btn-small" data-action="edit-supplier" data-id="${escapeHTML(s.id)}">Edit</button><button class="btn btn-danger btn-small" data-action="delete-supplier" data-id="${escapeHTML(s.id)}">Delete</button></div></td></tr>`).join("");
}

function saveSupplier(form) {
  const d=new FormData(form),id=d.get("id");
  const s={id:id||Store.uid("S"),name:String(d.get("name")).trim(),company:String(d.get("company")).trim(),phone:String(d.get("phone")).trim(),email:String(d.get("email")).trim(),address:String(d.get("address")).trim()};
  if(Object.values(s).some(v=>!String(v).trim()))throw new Error("Please complete every supplier field.");
  if(!/^[0-9+() -]{7,18}$/.test(s.phone))throw new Error("Enter a valid phone number.");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))throw new Error("Enter a valid email address.");
  const all=Store.get("suppliers");
  if(all.some(x=>x.company.toLowerCase()===s.company.toLowerCase()&&x.id!==id))throw new Error("This company already exists.");
  Store.set("suppliers",id?all.map(x=>x.id===id?s:x):[...all,s]);
  showNotice("Supplier saved successfully.");renderPage("suppliers");
}

function editSupplier(id) {
  const s=Store.get("suppliers").find(x=>x.id===id);if(!s)return;
  const f=document.getElementById("supplierForm");
  Object.keys(s).forEach(k=>{if(f.elements[k])f.elements[k].value=s[k];});
  document.getElementById("supplierTitle").textContent="Edit Supplier";
  f.scrollIntoView({behavior:"smooth"});
}

function deleteSupplier(id) {
  const s=Store.get("suppliers").find(x=>x.id===id);if(!s)return;
  if(Store.get("products").some(p=>p.supplier===s.company)){showNotice("This supplier is assigned to products. Update those products before deleting.",true);return;}
  if(!confirm(`Delete supplier "${s.company}"?`))return;
  Store.set("suppliers",Store.get("suppliers").filter(x=>x.id!==id));
  showNotice("Supplier deleted.");renderPage("suppliers");
}
