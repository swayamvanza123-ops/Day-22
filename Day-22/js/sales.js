
function renderSales() {
  const products=Store.get("products"), sales=Store.get("sales");
  return `<p class="page-intro">Create invoices and track customer sales.</p>
  <div class="panel"><h2>Create Sale / Invoice</h2><br>
  <form id="saleForm" class="form-grid">
    <div class="field"><label>Customer Name *</label><input name="customer" required></div>
    <div class="field"><label>Customer Phone</label><input name="phone" pattern="[0-9+() -]{7,18}"></div>
    <div class="field full"><label>Product *</label><select name="productId" id="saleProduct" required><option value="">Select product</option>${products.filter(p=>p.stock>0).map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)} — ${money(p.price)} (${p.stock} available)</option>`).join("")}</select></div>
    <div class="field"><label>Quantity *</label><input name="quantity" type="number" min="1" step="1" required></div>
    <div class="field"><label>Sale Date *</label><input name="date" type="date" value="${todayISO()}" max="${todayISO()}" required></div>
    <div class="field"><label>Discount (₹)</label><input name="discount" type="number" value="0" min="0" step="0.01" required></div>
    <div class="field"><label>Product Price</label><input id="salePrice" readonly placeholder="Select a product"></div>
    <div class="field full"><div class="summary-line"><span>Subtotal</span><strong id="saleSubtotal">₹0.00</strong></div><div class="summary-line summary-total"><span>Final Amount</span><strong id="saleTotal">${money(0)}</strong></div></div>
    <div class="form-actions"><button class="btn btn-primary" type="submit">Confirm Sale & Create Invoice</button></div>
  </form></div>
  <div class="panel"><div class="panel-heading"><h2>Sales History (${sales.length})</h2><input class="search" id="salesSearch" placeholder="Search invoice or customer..."></div>
  <div class="table-wrap"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Product</th><th>Qty</th><th>Date</th><th>Discount</th><th>Total</th><th>Invoice</th></tr></thead><tbody id="salesBody">${salesRows(sales)}</tbody></table></div></div>`;
}

function salesRows(list) {
  if(!list.length)return '<tr><td colspan="8" class="empty">No sales recorded yet.</td></tr>';
  return [...list].reverse().map(s=>`<tr><td>${escapeHTML(s.invoice)}</td><td>${escapeHTML(s.customer)}</td><td>${escapeHTML(s.productName)}</td><td>${s.quantity}</td><td>${escapeHTML(s.date)}</td><td>${money(s.discount)}</td><td><strong>${money(s.total)}</strong></td><td><button class="btn btn-secondary btn-small" data-action="invoice" data-id="${escapeHTML(s.id)}">View</button></td></tr>`).join("");
}

function updateSaleSummary() {
  const f=document.getElementById("saleForm");if(!f)return;
  const p=Store.get("products").find(p=>p.id===f.elements.productId.value);
  const q=Number(f.elements.quantity.value)||0,d=Number(f.elements.discount.value)||0;
  const subtotal=p?p.price*q:0;
  document.getElementById("salePrice").value=p?money(p.price):"";
  document.getElementById("saleSubtotal").textContent=money(subtotal);
  document.getElementById("saleTotal").textContent=money(Math.max(0,subtotal-d));
}

function saveSale(form) {
  const d=new FormData(form), products=Store.get("products");
  const p=products.find(x=>x.id===d.get("productId"));
  const q=Number(d.get("quantity")),discount=Number(d.get("discount")||0);
  const customer=String(d.get("customer")).trim(),date=d.get("date");
  if(!p||!customer)throw new Error("Select a product and enter the customer name.");
  if(!Number.isInteger(q)||q<1)throw new Error("Quantity must be a positive whole number.");
  if(q>p.stock)throw new Error(`Only ${p.stock} units are available.`);
  if(!date||date>todayISO())throw new Error("Choose a valid sale date.");
  if(!Number.isFinite(discount)||discount<0||discount>p.price*q)throw new Error("Discount must be between zero and the subtotal.");
  const sale={
    id:Store.uid("SALE"),invoice:"INV-"+Date.now().toString().slice(-9),
    customer,phone:String(d.get("phone")||"").trim(),productId:p.id,
    productName:p.name,quantity:q,price:p.price,cost:p.cost||0,
    subtotal:p.price*q,discount,total:p.price*q-discount,date
  };
  Store.set("products",products.map(x=>x.id===p.id?{...x,stock:x.stock-q}:x));
  recordStockChange({...p,stock:p.stock-q},p.stock,p.stock-q,"Sale "+sale.invoice,"Stock Out");
  Store.set("sales",[...Store.get("sales"),sale]);
  showNotice("Sale confirmed. Invoice "+sale.invoice+" created.");
  renderPage("sales");
}

function showInvoice(id) {
  const s=Store.get("sales").find(x=>x.id===id);if(!s)return;
  const content=`INVOICE: ${s.invoice}
Customer: ${s.customer}
Phone: ${s.phone||"—"}
Date: ${s.date}
Product: ${s.productName}
Quantity: ${s.quantity}
Unit Price: ${money(s.price)}
Subtotal: ${money(s.subtotal)}
Discount: ${money(s.discount)}
TOTAL: ${money(s.total)}`;
  alert(content);
}
