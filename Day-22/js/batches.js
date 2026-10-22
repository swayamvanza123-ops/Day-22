
function renderBatches() {
  const batches=Store.get("batches"),products=Store.get("products");
  return `<p class="page-intro">Track manufacturing, expiry, quantity and cost for every batch.</p>
  <div class="panel"><h2 id="batchTitle">Add Product Batch</h2><br>
  <form id="batchForm" class="form-grid">
    <input type="hidden" name="id">
    <div class="field"><label>Batch Number *</label><input name="batchNumber" required placeholder="BATCH-001"></div>
    <div class="field"><label>Product *</label><select name="productId" required><option value="">Select product</option>${products.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join("")}</select></div>
    <div class="field"><label>Manufacturing Date *</label><input name="manufacturingDate" type="date" max="${todayISO()}" required></div>
    <div class="field"><label>Expiry Date *</label><input name="expiryDate" type="date" min="${todayISO()}" required></div>
    <div class="field"><label>Batch Quantity *</label><input name="quantity" type="number" min="1" step="1" required></div>
    <div class="field"><label>Purchase Price Per Unit (₹) *</label><input name="purchasePrice" type="number" min="0" step="0.01" required></div>
    <div class="form-actions"><button class="btn btn-primary">Save Batch</button><button type="reset" class="btn btn-outline">Clear</button></div>
  </form></div>
  <div class="panel"><div class="panel-heading"><h2>Batch Records (${batches.length})</h2><input class="search" id="batchSearch" placeholder="Search batch or product..."></div>
  <div class="table-wrap"><table><thead><tr><th>Batch Number</th><th>Product</th><th>Manufactured</th><th>Expires</th><th>Quantity</th><th>Unit Cost</th><th>Batch Value</th><th>Status</th><th>Actions</th></tr></thead><tbody id="batchesBody">${batchRows(batches)}</tbody></table></div></div>`;
}

function batchRows(list) {
  if(!list.length)return '<tr><td colspan="9" class="empty">No batches recorded yet.</td></tr>';
  return [...list].reverse().map(b=>{
    const remaining=Math.ceil((new Date(b.expiryDate+"T00:00:00")-new Date(todayISO()+"T00:00:00"))/86400000);
    const status=remaining<0?'<span class="badge badge-red">Expired</span>':remaining<=30?'<span class="badge badge-yellow">Expiring soon</span>':'<span class="badge badge-green">Valid</span>';
    return `<tr><td>${escapeHTML(b.batchNumber)}</td><td>${escapeHTML(b.productName)}</td><td>${escapeHTML(b.manufacturingDate)}</td><td>${escapeHTML(b.expiryDate)}</td><td>${b.quantity}</td><td>${money(b.purchasePrice)}</td><td>${money(b.quantity*b.purchasePrice)}</td><td>${status}</td><td><div class="toolbar"><button class="btn btn-secondary btn-small" data-action="edit-batch" data-id="${escapeHTML(b.id)}">Edit</button><button class="btn btn-danger btn-small" data-action="delete-batch" data-id="${escapeHTML(b.id)}">Delete</button></div></td></tr>`;
  }).join("");
}

function saveBatch(form) {
  const d=new FormData(form),id=d.get("id"),all=Store.get("batches");
  const p=Store.get("products").find(x=>x.id===d.get("productId"));
  const b={
    id:id||Store.uid("B"),batchNumber:String(d.get("batchNumber")).trim(),
    productId:d.get("productId"),productName:p?.name||"",
    manufacturingDate:d.get("manufacturingDate"),expiryDate:d.get("expiryDate"),
    quantity:Number(d.get("quantity")),purchasePrice:Number(d.get("purchasePrice"))
  };
  if(!p)throw new Error("Select a valid product.");
  if(!b.batchNumber||!b.manufacturingDate||!b.expiryDate)throw new Error("Complete all batch details.");
  if(b.manufacturingDate>todayISO())throw new Error("Manufacturing date cannot be in the future.");
  if(b.expiryDate<=todayISO()||b.expiryDate<b.manufacturingDate)throw new Error("Expiry date must be after today and after manufacturing.");
  if(!Number.isInteger(b.quantity)||b.quantity<1||!Number.isFinite(b.purchasePrice)||b.purchasePrice<0)throw new Error("Enter a valid quantity and purchase price.");
  if(all.some(x=>x.batchNumber.toLowerCase()===b.batchNumber.toLowerCase()&&x.id!==id))throw new Error("Batch number already exists.");
  Store.set("batches",id?all.map(x=>x.id===id?b:x):[...all,b]);
  showNotice("Batch saved successfully.");renderPage("batches");
}

function editBatch(id) {
  const b=Store.get("batches").find(x=>x.id===id);if(!b)return;
  const f=document.getElementById("batchForm");
  Object.keys(b).forEach(k=>{if(f.elements[k])f.elements[k].value=b[k];});
  document.getElementById("batchTitle").textContent="Edit Batch";
  f.scrollIntoView({behavior:"smooth"});
}

function deleteBatch(id) {
  const b=Store.get("batches").find(x=>x.id===id);if(!b)return;
  if(!confirm(`Delete batch "${b.batchNumber}"?`))return;
  Store.set("batches",Store.get("batches").filter(x=>x.id!==id));
  showNotice("Batch deleted.");renderPage("batches");
}
