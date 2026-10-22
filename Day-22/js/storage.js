
const Store = {
  get(key, fallback = []) {
    try {
      const value = localStorage.getItem("day21_" + key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error("Storage read error:", error);
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem("day21_" + key, JSON.stringify(value));
  },
  uid(prefix = "ID") {
    return prefix + "-" + Date.now().toString(36) +
      "-" + Math.random().toString(36).slice(2, 7);
  }
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
}

function todayISO() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const defaultProducts = [
  {id:"P001",name:"Dell Laptop",category:"Electronics",price:50000,cost:40000,stock:20,supplier:"Tech World",description:"Professional laptop for work and study",image:""},
  {id:"P002",name:"Wireless Mouse",category:"Accessories",price:800,cost:450,stock:50,supplier:"Tech World",description:"Comfortable wireless mouse",image:""},
  {id:"P003",name:"Mechanical Keyboard",category:"Accessories",price:1500,cost:900,stock:35,supplier:"Digital Hub",description:"Mechanical keyboard for everyday use",image:""},
  {id:"P004",name:"LED Monitor",category:"Electronics",price:12000,cost:9500,stock:8,supplier:"Digital Hub",description:"Full HD computer monitor",image:""},
  {id:"P005",name:"Office Printer",category:"Electronics",price:15000,cost:11500,stock:5,supplier:"Print Solutions",description:"Compact office printer",image:""}
];

const defaultSuppliers = [
  {id:"S001",name:"Rahul Sharma",company:"Tech World",phone:"9876543210",email:"tech@example.com",address:"Ahmedabad, Gujarat"},
  {id:"S002",name:"Priya Patel",company:"Digital Hub",phone:"9876501234",email:"digital@example.com",address:"Vadodara, Gujarat"},
  {id:"S003",name:"Amit Shah",company:"Print Solutions",phone:"9876512345",email:"print@example.com",address:"Surat, Gujarat"}
];

const defaultCategories = [
  {id:"C001",name:"Electronics",description:"Electronic devices"},
  {id:"C002",name:"Accessories",description:"Computer accessories"},
  {id:"C003",name:"Furniture",description:"Office and store furniture"}
];

if (localStorage.getItem("day21_initialized") !== "yes") {
  Store.set("products", defaultProducts);
  Store.set("suppliers", defaultSuppliers);
  Store.set("categories", defaultCategories);
  Store.set("sales", []);
  Store.set("stockHistory", []);
  Store.set("batches", []);
  localStorage.setItem("day21_initialized", "yes");
}
