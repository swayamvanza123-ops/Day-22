
let currentPage = "dashboard";
let noticeTimer;

function showNotice(message, error = false) {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  notice.className = "notice " + (error ? "error" : "success");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.add("hidden"), 5000);
}

function renderPage(page = currentPage) {
  const renderers = {
    dashboard: renderDashboard,
    products: renderProducts,
    categories: renderCategories,
    suppliers: renderSuppliers,
    sales: renderSales,
    stock: renderStock,
    batches: renderBatches
  };

  if (!renderers[page]) page = "dashboard";
  currentPage = page;
  document.getElementById("pageTitle").textContent = {
    dashboard: "Dashboard", products: "Products",
    categories: "Categories", suppliers: "Suppliers",
    sales: "Sales", stock: "Stock Management",
    batches: "Batch Management"
  }[page];

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  document.getElementById("pageContent").innerHTML = renderers[page]();
  document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
}

function filterTable(inputId, bodyId, renderRows, items, getText) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    document.getElementById(bodyId).innerHTML =
      renderRows(items().filter(item => getText(item).toLowerCase().includes(query)));
  });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    renderPage(pageButton.dataset.page);
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  try {
    switch (button.dataset.action) {
      case "edit-product": editProduct(id); break;
      case "delete-product": deleteProduct(id); break;
      case "edit-category": editCategory(id); break;
      case "delete-category": deleteCategory(id); break;
      case "edit-supplier": editSupplier(id); break;
      case "delete-supplier": deleteSupplier(id); break;
      case "edit-batch": editBatch(id); break;
      case "delete-batch": deleteBatch(id); break;
      case "invoice": showInvoice(id); break;
    }
  } catch (error) {
    showNotice(error.message || "Something went wrong.", true);
  }
});

document.addEventListener("submit", async event => {
  const form = event.target;
  const handlers = {
    productForm: saveProduct,
    categoryForm: saveCategory,
    supplierForm: saveSupplier,
    saleForm: saveSale,
    stockForm: saveStock,
    batchForm: saveBatch
  };
  if (!handlers[form.id]) return;

  event.preventDefault();
  const submitButton = form.querySelector('[type="submit"], button:not([type])');
  if (submitButton) submitButton.disabled = true;

  try {
    await handlers[form.id](form);
  } catch (error) {
    showNotice(error.message || "Unable to save your changes.", true);
  } finally {
    if (submitButton && submitButton.isConnected) submitButton.disabled = false;
  }
});

document.addEventListener("input", event => {
  const id = event.target.id;
  if (id === "productSearch") {
    const q = event.target.value.toLowerCase();
    document.getElementById("productsBody").innerHTML =
      productRows(Store.get("products").filter(p =>
        [p.name,p.category,p.supplier,p.id].some(v =>
          String(v || "").toLowerCase().includes(q)
        )
      ));
  }

  if (id === "supplierSearch") {
    const q = event.target.value.toLowerCase();
    document.getElementById("suppliersBody").innerHTML =
      supplierRows(Store.get("suppliers").filter(s =>
        [s.name,s.company,s.phone,s.email].some(v =>
          String(v || "").toLowerCase().includes(q)
        )
      ));
  }

  if (id === "salesSearch") {
    const q = event.target.value.toLowerCase();
    document.getElementById("salesBody").innerHTML =
      salesRows(Store.get("sales").filter(s =>
        [s.invoice,s.customer,s.productName].some(v =>
          String(v || "").toLowerCase().includes(q)
        )
      ));
  }

  if (id === "stockSearch" || id === "stockFilter") filterStock();
  if (id === "batchSearch") filterBatches();
  if (id === "saleProduct" || id === "saleForm") updateSaleSummary();
});

document.addEventListener("change", event => {
  if (event.target.id === "saleProduct") updateSaleSummary();
  if (event.target.id === "stockFilter") filterStock();
});

function filterStock() {
  const q=(document.getElementById("stockSearch")?.value||"").toLowerCase();
  const type=document.getElementById("stockFilter")?.value||"";
  const items=Store.get("stockHistory").filter(h =>
    h.productName.toLowerCase().includes(q) && (!type||h.type===type)
  );
  document.getElementById("stockBody").innerHTML=stockRows(items);
}

function filterBatches() {
  const q=(document.getElementById("batchSearch")?.value||"").toLowerCase();
  const items=Store.get("batches").filter(b =>
    [b.batchNumber,b.productName].some(v=>String(v||"").toLowerCase().includes(q))
  );
  document.getElementById("batchesBody").innerHTML=batchRows(items);
}

document.addEventListener("reset", event => {
  const form=event.target;
  if (!form.id) return;
  setTimeout(()=>{
    if (form.id==="productForm") {
      document.getElementById("productFormTitle").textContent="Add Product";
      const button=form.querySelector('[type="submit"]');
      if(button)button.textContent="Save Product";
    }
    if (form.id==="categoryForm") document.getElementById("categoryTitle").textContent="Add Category";
    if (form.id==="supplierForm") document.getElementById("supplierTitle").textContent="Add Supplier";
    if (form.id==="batchForm") document.getElementById("batchTitle").textContent="Add Product Batch";
    if (form.id==="saleForm") updateSaleSummary();
  },0);
});

document.addEventListener("DOMContentLoaded", () => {
  renderPage("dashboard");
});
