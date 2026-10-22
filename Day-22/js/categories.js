
function renderCategories() {
  const categories=Store.get("categories");
  return `<p class="page-intro">Organize your products into categories.</p>
  <div class="panel"><h2 id="categoryTitle">Add Category</h2><br>
    <form id="categoryForm" class="form-grid">
      <input type="hidden" name="id">
      <div class="field"><label>Category Name *</label><input name="name" required minlength="2" placeholder="Category name"></div>
      <div class="field"><label>Description</label><input name="description" placeholder="Category description"></div>
      <div class="form-actions"><button class="btn btn-primary">Save Category</button><button class="btn btn-outline" type="reset">Clear</button></div>
    </form>
  </div>
  <div class="panel"><div class="panel-heading"><h2>All Categories (${categories.length})</h2></div>
  <div class="table-wrap"><table><thead><tr><th>Category</th><th>Description</th><th>Products</th><th>Actions</th></tr></thead><tbody>
  ${categories.length?categories.map(c=>`<tr><td><strong>${escapeHTML(c.name)}</strong></td><td>${escapeHTML(c.description||"—")}</td><td>${Store.get("products").filter(p=>p.category===c.name).length}</td><td><div class="toolbar"><button class="btn btn-secondary btn-small" data-action="edit-category" data-id="${escapeHTML(c.id)}">Edit</button><button class="btn btn-danger btn-small" data-action="delete-category" data-id="${escapeHTML(c.id)}">Delete</button></div></td></tr>`).join(""):'<tr><td colspan="4" class="empty">No categories yet.</td></tr>'}
  </tbody></table></div></div>`;
}

function saveCategory(form) {
  const d=new FormData(form), id=d.get("id");
  const name=String(d.get("name")).trim();
  const description=String(d.get("description")||"").trim();
  if(name.length<2) throw new Error("Category name must have at least 2 characters.");
  const all=Store.get("categories");
  if(all.some(c=>c.name.toLowerCase()===name.toLowerCase()&&c.id!==id)) throw new Error("This category already exists.");
  if(id){
    const old=all.find(c=>c.id===id);
    if(old&&old.name!==name&&Store.get("products").some(p=>p.category===old.name)) throw new Error("Move the products to another category before renaming this category.");
    Store.set("categories",all.map(c=>c.id===id?{...c,name,description}:c));
  }else Store.set("categories",[...all,{id:Store.uid("C"),name,description}]);
  showNotice("Category saved successfully."); renderPage("categories");
}

function editCategory(id) {
  const c=Store.get("categories").find(x=>x.id===id); if(!c)return;
  const f=document.getElementById("categoryForm");
  f.elements.id.value=c.id; f.elements.name.value=c.name;
  f.elements.description.value=c.description||"";
  document.getElementById("categoryTitle").textContent="Edit Category";
  f.scrollIntoView({behavior:"smooth"});
}

function deleteCategory(id) {
  const c=Store.get("categories").find(x=>x.id===id); if(!c)return;
  if(Store.get("products").some(p=>p.category===c.name)){showNotice("This category has products. Reassign them before deleting.",true);return;}
  if(!confirm(`Delete category "${c.name}"?`))return;
  Store.set("categories",Store.get("categories").filter(x=>x.id!==id));
  showNotice("Category deleted."); renderPage("categories");
}
