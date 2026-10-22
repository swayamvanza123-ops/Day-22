
function renderProducts() {
  const products = Store.get("products");
  const categories = Store.get("categories");
  const suppliers = Store.get("suppliers");

  return `
    <p class="page-intro">Manage your inventory, product images, prices and quantities.</p>
    <div class="panel">
      <div class="panel-heading"><h2 id="productFormTitle">Add Product</h2></div>
      <form id="productForm" class="form-grid">
        <input type="hidden" name="id">
        <div class="field"><label>Product Name *</label><input name="name" required minlength="2" placeholder="e.g. Dell Laptop"></div>
        <div class="field"><label>Category *</label>
          <select name="category" required>
            <option value="">Choose category</option>
            ${categories.map(c=>`<option>${escapeHTML(c.name)}</option>`).join("")}
            ${categories.length===0?'<option>General</option>':''}
          </select>
        </div>
        <div class="field"><label>Selling Price (₹) *</label><input name="price" type="number" min="0.01" step="0.01" required></div>
        <div class="field"><label>Purchase Cost (₹)</label><input name="cost" type="number" min="0" step="0.01" value="0"></div>
        <div class="field"><label>Available Quantity *</label><input name="stock" type="number" min="0" step="1" required></div>
        <div class="field"><label>Supplier</label>
          <select name="supplier"><option value="">No supplier</option>
            ${suppliers.map(s=>`<option value="${escapeHTML(s.company)}">${escapeHTML(s.company)}</option>`).join("")}
          </select>
        </div>
        <div class="field full"><label>Product Image (optional)</label><input name="image" type="file" accept="image/png,image/jpeg,image/webp"></div>
        <div class="field full"><label>Description *</label><textarea name="description" required minlength="5" placeholder="Describe this product..."></textarea></div>
        <div class="form-actions"><button class="btn btn-primary" type="submit">Save Product</button><button class="btn btn-outline" type="reset">Clear Form</button></div>
      </form>
    </div>
    <div class="panel">
      <div class="panel-heading"><h2>All Products (${products.length})</h2><input class="search" id="productSearch" placeholder="Search products..."></div>
      <div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Inventory Value</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="productsBody">${productRows(products)}</tbody></table></div>
    </div>`;
}

function productRows(products) {
  if (!products.length) return '<tr><td colspan="7" class="empty">No products found. Add your first product above.</td></tr>';
  return products.map(p=>`
    <tr>
      <td><div class="product-cell">
        ${p.image?`<img class="product-thumb" src="${escapeHTML(p.image)}" alt="">`:'<div class="product-thumb"></div>'}
        <div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.id)}</small></div>
      </div></td>
      <td>${escapeHTML(p.category)}</td><td>${money(p.price)}</td><td>${p.stock}</td>
      <td>${money(p.price*p.stock)}</td>
      <td>${p.stock===0?'<span class="badge badge-red">Out of stock</span>':p.stock<10?'<span class="badge badge-yellow">Low stock</span>':'<span class="badge badge-green">In stock</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-secondary btn-small" data-action="edit-product" data-id="${escapeHTML(p.id)}">Edit</button>
        <button class="btn btn-danger btn-small" data-action="delete-product" data-id="${escapeHTML(p.id)}">Delete</button>
      </div></td>
    </tr>`).join("");
}

async function saveProduct(form) {
  const data = new FormData(form);
  const id = data.get("id");
  const oldProducts = Store.get("products");
  const old = oldProducts.find(p=>p.id===id);
  let image = old?.image || "";
  const file = data.get("image");

  if (file && file.size) {
    if (!file.type.startsWith("image/")) throw new Error("Choose a valid image.");
    if (file.size > 1024 * 1024) throw new Error("Image must be smaller than 1 MB.");
    image = await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
  }

  const product = {
    id: id || Store.uid("P"),
    name: String(data.get("name")).trim(),
    category: data.get("category"),
    price: Number(data.get("price")),
    cost: Number(data.get("cost") || 0),
    stock: Number(data.get("stock")),
    supplier: data.get("supplier") || "",
    description: String(data.get("description")).trim(),
    image
  };

  if (!product.name || product.name.length < 2 || !product.category ||
      !product.description || product.description.length < 5 ||
      !Number.isFinite(product.price) || product.price <= 0 ||
      !Number.isInteger(product.stock) || product.stock < 0 ||
      !Number.isFinite(product.cost) || product.cost < 0) {
    throw new Error("Enter a valid name, category, description, price, cost and whole-number quantity.");
  }

  if (old) {
    if (old.stock !== product.stock) {
      recordStockChange(product, old.stock, product.stock, "Product edited", "Adjustment");
    }
    Store.set("products", oldProducts.map(p=>p.id===id?product:p));
  } else {
    Store.set("products", [...oldProducts,product]);
  }
  showNotice(old?"Product updated successfully.":"Product added successfully.");
  renderPage("products");
}

function editProduct(id) {
  const p=Store.get("products").find(x=>x.id===id);
  if (!p) return;
  const form=document.getElementById("productForm");
  Object.keys(p).forEach(key=>{
    if (form.elements[key] && key!=="image") form.elements[key].value=p[key] ?? "";
  });
  document.getElementById("productFormTitle").textContent="Edit Product";
  form.querySelector('button[type="submit"]').textContent="Update Product";
  form.scrollIntoView({behavior:"smooth",block:"start"});
}

function deleteProduct(id) {
  const p=Store.get("products").find(x=>x.id===id);
  if (!p) return;
  if (Store.get("batches").some(b=>b.productId===id) ||
      Store.get("sales").some(s=>s.productId===id)) {
    showNotice("This product has sales or batch history. Keep it to preserve your records.",true);
    return;
  }
  if (!confirm(`Delete "${p.name}"?`)) return;
  Store.set("products",Store.get("products").filter(x=>x.id!==id));
  showNotice("Product deleted.");
  renderPage("products");
}
