const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = JSON.parse(localStorage.getItem("campus_cart")) || [];
let activeCategory = "all";
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");

function renderMenu(items) {
  menuGrid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });

  menuGrid.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(Number(button.dataset.id));
    });
  });
}

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  saveCart();
  renderCart();
  cartMsgEl.textContent = "";
}

function saveCart() {
  localStorage.setItem("campus_cart", JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name}</span>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
        </div>
        <span>₹${(Number(item.price) * item.qty).toFixed(2)}</span>
      `;
      cartList.appendChild(li);
    });

    cartList.querySelectorAll(".qty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(Number(button.dataset.id), button.dataset.action);
      });
    });
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);

  cartSubtotalEl.textContent = subtotal.toFixed(2);
  cartCountEl.textContent = totalQuantity;
}

function changeQuantity(itemId, action) {
  const item = cart.find((cartItem) => cartItem.id === itemId);
  if (!item) return;

  item.qty += action === "increase" ? 1 : -1;
  cart = cart.filter((cartItem) => cartItem.qty > 0);
  saveCart();
  renderCart();
}

function renderFilteredMenu() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  renderMenu(filtered);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderFilteredMenu();
  });
});

searchInput.addEventListener("input", renderFilteredMenu);

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Your cart is empty. Add an item before checkout.";
    return;
  }
  cartMsgEl.textContent = "";
  window.location.href = "pages/checkout.html";
});

// Initialize page
renderMenu(MENU_ITEMS);
renderCart();
