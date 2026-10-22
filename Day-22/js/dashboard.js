
function renderDashboard() {
  const products=Store.get("products"),sales=Store.get("sales"),suppliers=Store.get("suppliers"),batches=Store.get("batches");
  const totalStock=products.reduce((n,p)=>n+Number(p.stock||0),0);
  const value=products.reduce((n,p)=>n+Number(p.price||0)*Number(p.stock||0),0);
  const low=products.filter(p=>p.stock<10);
  const revenue=sales.reduce((n,s)=>n+Number(s.total||0),0);
  const thisMonth=sales.filter(s=>s.date?.slice(0,7)===todayISO().slice(0,7)).reduce((n,s)=>n+s.total,0);
  const expired=batches.filter(b=>b.expiryDate<todayISO());
  const stat=(label,value,icon,note)=>`<div class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`;

  return `<p class="page-intro">Welcome back! Here's what's happening in your store today.</p>
    <div class="grid stats-grid">
      ${stat("Total Products",products.length,"▣","Products in your inventory")}
      ${stat("Total Stock",totalStock.toLocaleString("en-IN"),"▤","Units currently available")}
      ${stat("Inventory Value",money(value),"₹","Selling price × current stock")}
      ${stat("Low-Stock Products",low.length,"⚠","Products with fewer than 10 units")}
    </div>
    <div class="grid stats-grid">
      ${stat("Total Suppliers",suppliers.length,"♙","Registered suppliers")}
      ${stat("Total Sales",money(revenue),"↗","Revenue after discounts")}
      ${stat("This Month's Sales",money(thisMonth),"▦","Sales recorded this month")}
      ${stat("Expired Batches",expired.length,"▧","Batches past expiry date")}
    </div>
    <div class="grid two-col">
      <div class="panel"><div class="panel-heading"><h2>Low-Stock Alerts</h2><button class="btn btn-secondary btn-small" data-page="products">View Products →</button></div>
      <div class="mini-list">${low.length?low.map(p=>`<div class="mini-row"><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.category)} · ${p.stock} units remaining</small><div class="progress"><span style="width:${Math.min(100,p.stock/10*100)}%"></span></div></div><span class="badge ${p.stock===0?'badge-red':'badge-yellow'}">${p.stock===0?'Out of stock':'Low stock'}</span></div>`).join(""):'<div class="empty">All products have sufficient stock.</div>'}</div></div>
      <div class="panel"><div class="panel-heading"><h2>Quick Actions</h2></div>
        <div class="mini-list">
          <div class="mini-row"><div><strong>Add a new product</strong><small>Register products and inventory quantities</small></div><button class="btn btn-primary btn-small" data-page="products">Open</button></div>
          <div class="mini-row"><div><strong>Record a sale</strong><small>Create a sale and reduce stock</small></div><button class="btn btn-primary btn-small" data-page="sales">Open</button></div>
          <div class="mini-row"><div><strong>Update stock</strong><small>Receive or dispatch products</small></div><button class="btn btn-primary btn-small" data-page="stock">Open</button></div>
          <div class="mini-row"><div><strong>Manage batches</strong><small>Review expiry dates and purchase costs</small></div><button class="btn btn-primary btn-small" data-page="batches">Open</button></div>
        </div>
      </div>
    </div>
    <div class="panel"><div class="panel-heading"><h2>Recent Products</h2><button class="btn btn-secondary btn-small" data-page="products">Manage Products →</button></div>
    <div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Unit Price</th><th>Stock</th><th>Inventory Value</th><th>Status</th></tr></thead>
    <tbody>${products.length?products.slice(-5).reverse().map(p=>`<tr><td><strong>${escapeHTML(p.name)}</strong></td><td>${escapeHTML(p.category)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td>${money(p.price*p.stock)}</td><td><span class="badge ${p.stock===0?'badge-red':p.stock<10?'badge-yellow':'badge-green'}">${p.stock===0?'Out of stock':p.stock<10?'Low stock':'In stock'}</span></td></tr>`).join(""):'<tr><td colspan="6" class="empty">No products available.</td></tr>'}</tbody></table></div></div>
    <div class="panel"><div class="panel-heading"><h2>Recent Sales</h2><button class="btn btn-secondary btn-small" data-page="sales">View Sales →</button></div>
    <div class="table-wrap"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Product</th><th>Date</th><th>Amount</th></tr></thead><tbody>${sales.length?[...sales].reverse().slice(0,5).map(s=>`<tr><td>${escapeHTML(s.invoice)}</td><td>${escapeHTML(s.customer)}</td><td>${escapeHTML(s.productName)}</td><td>${escapeHTML(s.date)}</td><td><strong>${money(s.total)}</strong></td></tr>`).join(""):'<tr><td colspan="5" class="empty">No sales recorded yet.</td></tr>'}</tbody></table></div></div>`;
}
