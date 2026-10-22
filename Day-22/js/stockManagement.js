
function recordStockChange(product,previous,updated,reason,type) {
  const history=Store.get("stockHistory");
  history.push({
    id:Store.uid("ST"),productId:product.id,productName:product.name,
    type:type==="Adjustment"?"Adjustment":type,
    quantity:Math.abs(updated-previous),previous,updated,
    reason,date:todayISO()
  });
  Store.set("stockHistory",history);
}

function renderStock() {
  const products=Store.get("products"),history=Store.get("stockHistory");
  return `<p class="page-intro">Track every stock movement with an auditable history.</p>
  <div class="panel"><h2>Stock In / Stock Out</h2><br>
  <form id="stockForm" class="form-grid">
    <div class="field full"><label>Product *</label><select name="productId" required><option value="">Select product</option>${products.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)} — Current stock: ${p.stock}</option>`).join("")}</select></div>
    <div class="field"><label>Movement Type *</label><select name="type" required><option value="Stock In">Stock In</option><option value="Stock Out">Stock Out</option></select></div>
    <div class="field"><label>Quantity *</label><input name="quantity" type="number" min="1" step="1" required></div>
    <div class="field full"><label>Reason *</label><input name="reason" required placeholder="Purchase, return, damage, dispatch..."></div>
    <div class="form-actions"><button class="btn btn-primary">Update Stock</button></div>
  </form></div>
  <div class="panel"><div class="panel-heading"><h2>Stock History (${history.length})</h2><div class="toolbar"><input id="stockSearch" class="search" placeholder="Search product..."><select id="stockFilter"><option value="">All movements</option><option>Stock In</option><option>Stock Out</option><option>Adjustment</option></select></div></div>
  <div class="table-wrap"><table><thead><tr><th>Product</th><th>Movement</th><th>Quantity</th><th>Previous Stock</th><th>Updated Stock</th><th>Reason</th><th>Date</th></tr></thead><tbody id="stockBody">${stockRows(history)}</tbody></table></div></div>`;
}

function stockRows(list) {
  if(!list.length)return '<tr><td colspan="7" class="empty">No stock movements recorded yet.</td></tr>';
  return [...list].reverse().map(h=>`<tr><td>${escapeHTML(h.productName)}</td><td><span class="badge ${h.type==="Stock In"?"badge-green":h.type==="Stock Out"?"badge-red":"badge-purple"}">${escapeHTML(h.type)}</span></td><td>${h.quantity}</td><td>${h.previous}</td><td>${h.updated}</td><td>${escapeHTML(h.reason)}</td><td>${escapeHTML(h.date)}</td></tr>`).join("");
}

function saveStock(form) {
  const d=new FormData(form),id=d.get("productId"),type=d.get("type"),q=Number(d.get("quantity"));
  const reason=String(d.get("reason")).trim(),products=Store.get("products");
  const p=products.find(x=>x.id===id);
  if(!p)throw new Error("Select a valid product.");
  if(!Number.isInteger(q)||q<1)throw new Error("Quantity must be a positive whole number.");
  if(!reason)throw new Error("Enter a reason for the stock movement.");
  const updated=type==="Stock In"?p.stock+q:p.stock-q;
  if(updated<0)throw new Error(`Insufficient stock. Only ${p.stock} units are available.`);
  Store.set("products",products.map(x=>x.id===id?{...x,stock:updated}:x));
  recordStockChange({...p,stock:updated},p.stock,updated,reason,type);
  showNotice("Stock updated successfully.");renderPage("stock");
}
