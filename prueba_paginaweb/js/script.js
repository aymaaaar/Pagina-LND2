// ==========================================
// CONSTANTS (SNAKE_CASE uppercase)
// ==========================================
const CART_ITEMS = 'cart-items';
const CART_LINK = 'cart-link';
const CART_TOTAL = 'cart-total';
const CHECKOUT_TOTAL = 'checkout-total';
const PRODUCTS_STORAGE_KEY = 'prestige_products';
const MIN_NAME_LENGTH = 3;
const MIN_ADDRESS_LENGTH = 10;
const MIN_MESSAGE_LENGTH = 10;
const PHONE_PATTERN = /^[0-9]{9,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRICE_PATTERN = /^[0-9]+(\.[0-9]{1,2})?$/;

// ==========================================
// VARIABLES (camelCase)
// ==========================================
let cart = [];
let total = 0;
let products = [];
let editingProductId = null;

// ==========================================
// PRODUCT MANAGEMENT (COMPLETE CRUD)
// ==========================================

// Initialize products from localStorage or default data
function initializeProducts() {
  const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  
  if (storedProducts) {
    products = JSON.parse(storedProducts);
  } else {
    products = [
      {
        id: 1,
        name: 'Chaqueta Vintage',
        price: 50,
        image: 'img/vintage-jacket.webp',
        description: 'Chaqueta vintage de los años 90'
      },
      {
        id: 2,
        name: 'Camiseta Urbana',
        price: 20,
        image: 'img/vintage-tshirt.webp',
        description: 'Camiseta urbana de algodón'
      },
      {
        id: 3,
        name: 'Sudadera',
        price: 40,
        image: 'img/hoodie-prestige.jpg',
        description: 'Sudadera con capucha vintage'
      },
      {
        id: 4,
        name: 'Zapatillas',
        price: 100,
        image: 'img/af1.webp',
        description: 'Zapatillas deportivas retro'
      },
      {
        id: 5,
        name: 'Calcetines',
        price: 15,
        image: 'img/prestige-socks.webp',
        description: 'Pack de calcetines vintage'
      },
      {
        id: 6,
        name: 'Pantalones',
        price: 25,
        image: 'img/vintage-pants.webp',
        description: 'Pantalones vintage wide leg'
      },
      {
        id: 7,
        name: 'Cinturón',
        price: 50,
        image: 'img/vintage-belt.webp',
        description: 'Cinturón de cuero vintage'
      }
    ];
    saveProductsToStorage();
  }
}

// Save products to localStorage
function saveProductsToStorage() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

// Get next available ID
function getNextProductId() {
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

// CREATE - Add new product
function createProduct(name, price, image, description) {
  const newProduct = {
    id: getNextProductId(),
    name: name,
    price: parseFloat(price),
    image: image || 'img/default-product.jpg',
    description: description || 'Sin descripción'
  };
  
  products.push(newProduct);
  saveProductsToStorage();
  renderProducts();
  return newProduct;
}

// READ - Display products
function renderProducts() {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.setAttribute('data-id', product.id);
    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='img/default-product.jpg'">
      <h3>${product.name}</h3>
      <p class="product-price">${product.price}€</p>
      <p class="product-description">${product.description}</p>
      <div class="product-buttons">
        <button type="button" onclick="addToCart('${product.name}', ${product.price})" class="btn-add-cart">
          <i class="fas fa-shopping-cart"></i> Añadir
        </button>
        <button type="button" onclick="editProduct(${product.id})" class="btn-edit">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button type="button" onclick="deleteProduct(${product.id})" class="btn-delete">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </div>
    `;
    productGrid.appendChild(productDiv);
  });
  
  // Trigger scroll animation for new products
  observeProducts();
}

// UPDATE - Edit existing product
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  editingProductId = id;
  
  // Fill form with product data
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-image').value = product.image;
  document.getElementById('product-description').value = product.description;
  
  // Change button text and scroll to form
  const submitButton = document.querySelector('#add-product-form button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
  submitButton.classList.add('btn-update');
  
  // Add cancel button if not exists
  let cancelButton = document.getElementById('cancel-edit-btn');
  if (!cancelButton) {
    cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.id = 'cancel-edit-btn';
    cancelButton.className = 'btn-secondary';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
    cancelButton.onclick = cancelEdit;
    submitButton.parentNode.appendChild(cancelButton);
  }
  
  scrollToElement('add-product-form');
  showNotification('📝 Modo edición activado');
}

function updateProduct(id, name, price, image, description) {
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return;
  
  products[productIndex] = {
    id: id,
    name: name,
    price: parseFloat(price),
    image: image,
    description: description
  };
  
  saveProductsToStorage();
  renderProducts();
  cancelEdit();
  showNotification('✓ Producto actualizado exitosamente');
}

function cancelEdit() {
  editingProductId = null;
  
  // Reset form
  document.getElementById('add-product-form').reset();
  
  // Reset button
  const submitButton = document.querySelector('#add-product-form button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-plus"></i> Añadir Producto';
  submitButton.classList.remove('btn-update');
  
  // Remove cancel button
  const cancelButton = document.getElementById('cancel-edit-btn');
  if (cancelButton) {
    cancelButton.remove();
  }
  
  // Clear errors
  clearProductFormErrors();
}

// DELETE - Remove product
function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  // Show custom confirmation
  showConfirmation(
    `¿Estás seguro de eliminar "${product.name}"?`,
    () => {
      products = products.filter(p => p.id !== id);
      saveProductsToStorage();
      renderProducts();
      showNotification('✓ Producto eliminado');
    }
  );
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function validateProductName() {
  const input = document.getElementById('product-name');
  const error = document.getElementById('product-name-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El nombre es obligatorio';
    return false;
  }
  
  if (value.length < MIN_NAME_LENGTH) {
    error.textContent = `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateProductPrice() {
  const input = document.getElementById('product-price');
  const error = document.getElementById('product-price-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El precio es obligatorio';
    return false;
  }
  
  if (!PRICE_PATTERN.test(value)) {
    error.textContent = 'El precio debe ser un número válido (ej: 50 o 50.99)';
    return false;
  }
  
  if (parseFloat(value) <= 0) {
    error.textContent = 'El precio debe ser mayor que 0';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateProductImage() {
  const input = document.getElementById('product-image');
  const error = document.getElementById('product-image-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'La URL de la imagen es obligatoria';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateProductDescription() {
  const input = document.getElementById('product-description');
  const error = document.getElementById('product-description-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'La descripción es obligatoria';
    return false;
  }
  
  if (value.length < 5) {
    error.textContent = 'La descripción debe tener al menos 5 caracteres';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateProductForm() {
  const isNameValid = validateProductName();
  const isPriceValid = validateProductPrice();
  const isImageValid = validateProductImage();
  const isDescriptionValid = validateProductDescription();
  
  return isNameValid && isPriceValid && isImageValid && isDescriptionValid;
}

function clearProductFormErrors() {
  document.getElementById('product-name-error').textContent = '';
  document.getElementById('product-price-error').textContent = '';
  document.getElementById('product-image-error').textContent = '';
  document.getElementById('product-description-error').textContent = '';
}

// Checkout validations
function validateCheckoutName() {
  const input = document.getElementById('checkout-name');
  const error = document.getElementById('checkout-name-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El nombre es obligatorio';
    return false;
  }
  
  if (value.length < MIN_NAME_LENGTH) {
    error.textContent = `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateCheckoutEmail() {
  const input = document.getElementById('checkout-email');
  const error = document.getElementById('checkout-email-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El email es obligatorio';
    return false;
  }
  
  if (!EMAIL_PATTERN.test(value)) {
    error.textContent = 'El email no es válido';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateCheckoutAddress() {
  const input = document.getElementById('checkout-address');
  const error = document.getElementById('checkout-address-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'La dirección es obligatoria';
    return false;
  }
  
  if (value.length < MIN_ADDRESS_LENGTH) {
    error.textContent = `La dirección debe tener al menos ${MIN_ADDRESS_LENGTH} caracteres`;
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateCheckoutPhone() {
  const input = document.getElementById('checkout-phone');
  const error = document.getElementById('checkout-phone-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El teléfono es obligatorio';
    return false;
  }
  
  if (!PHONE_PATTERN.test(value)) {
    error.textContent = 'El teléfono debe tener al menos 9 dígitos';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateCheckoutForm() {
  const isNameValid = validateCheckoutName();
  const isEmailValid = validateCheckoutEmail();
  const isAddressValid = validateCheckoutAddress();
  const isPhoneValid = validateCheckoutPhone();
  
  return isNameValid && isEmailValid && isAddressValid && isPhoneValid;
}

// Contact validations
function validateContactName() {
  const input = document.getElementById('contact-name');
  const error = document.getElementById('contact-name-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El nombre es obligatorio';
    return false;
  }
  
  if (value.length < MIN_NAME_LENGTH) {
    error.textContent = `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`;
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateContactEmail() {
  const input = document.getElementById('contact-email');
  const error = document.getElementById('contact-email-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El email es obligatorio';
    return false;
  }
  
  if (!EMAIL_PATTERN.test(value)) {
    error.textContent = 'El email no es válido';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateContactSubject() {
  const input = document.getElementById('contact-subject');
  const error = document.getElementById('contact-subject-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El asunto es obligatorio';
    return false;
  }
  
  if (value.length < 5) {
    error.textContent = 'El asunto debe tener al menos 5 caracteres';
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateContactMessage() {
  const input = document.getElementById('contact-message');
  const error = document.getElementById('contact-message-error');
  const value = input.value.trim();
  
  if (value.length === 0) {
    error.textContent = 'El mensaje es obligatorio';
    return false;
  }
  
  if (value.length < MIN_MESSAGE_LENGTH) {
    error.textContent = `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`;
    return false;
  }
  
  error.textContent = '';
  return true;
}

function validateContactForm() {
  const isNameValid = validateContactName();
  const isEmailValid = validateContactEmail();
  const isSubjectValid = validateContactSubject();
  const isMessageValid = validateContactMessage();
  
  return isNameValid && isEmailValid && isSubjectValid && isMessageValid;
}

// ==========================================
// CART FUNCTIONS
// ==========================================

function addToCart(itemName, price) {
  cart.push({ name: itemName, price: price });
  total += price;
  updateCart();
  showNotification('✓ Producto añadido al carrito');
}

function updateCart() {
  const cartItems = document.getElementById(CART_ITEMS);
  const cartLink = document.getElementById(CART_LINK);
  const cartTotal = document.getElementById(CART_TOTAL);

  cartItems.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name} - ${item.price}€</span>
      <button type="button" onclick="removeFromCart(${index})" class="btn-remove">
        <i class="fas fa-times"></i>
      </button>
    `;
    cartItems.appendChild(li);
  });

  cartLink.textContent = `Carrito (${cart.length})`;
  cartTotal.textContent = total.toFixed(2);
  document.getElementById(CHECKOUT_TOTAL).textContent = total.toFixed(2);

  if (cart.length > 0) {
    document.getElementById('cart').style.display = 'block';
  }
}

function removeFromCart(index) {
  total -= cart[index].price;
  cart.splice(index, 1);
  updateCart();
  
  if (cart.length === 0) {
    document.getElementById('cart').style.display = 'none';
  }
  
  showNotification('Producto eliminado del carrito');
}

function clearCart() {
  cart = [];
  total = 0;
  updateCart();
  document.getElementById('cart').style.display = 'none';
  document.getElementById('checkout').style.display = 'none';
}

function showCart() {
  const cartElement = document.getElementById('cart');
  if (cart.length === 0) {
    showNotification('⚠ Tu carrito está vacío');
    return;
  }
  cartElement.style.display = cartElement.style.display === 'none' ? 'block' : 'none';
}

function showCheckout() {
  if (cart.length > 0) {
    document.getElementById('cart').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
    scrollToElement('checkout');
  } else {
    showNotification('⚠ Tu carrito está vacío');
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

function showConfirmation(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirmation-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  modal.innerHTML = `
    <h3>Confirmar acción</h3>
    <p>${message}</p>
    <div class="confirmation-buttons">
      <button type="button" class="btn-confirm">Sí, eliminar</button>
      <button type="button" class="btn-cancel">Cancelar</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  modal.querySelector('.btn-confirm').onclick = () => {
    onConfirm();
    overlay.remove();
  };
  
  modal.querySelector('.btn-cancel').onclick = () => {
    overlay.remove();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
}

function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToShop() {
  scrollToElement('shop');
}

// ==========================================
// SCROLL ANIMATIONS (Intersection Observer)
// ==========================================

function observeProducts() {
  const products = document.querySelectorAll('.product');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  products.forEach(product => {
    observer.observe(product);
  });
}

function observeGalleryItems() {
  const items = document.querySelectorAll('.gallery-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  items.forEach(item => {
    observer.observe(item);
  });
}

function observeSections() {
  const sections = document.querySelectorAll('#about, #contact');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize products
  initializeProducts();
  renderProducts();
  
  // Initialize scroll animations
  observeGalleryItems();
  observeSections();
  
  // Add product form (CREATE / UPDATE)
  const addProductForm = document.getElementById('add-product-form');
  addProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateProductForm()) {
      const name = document.getElementById('product-name').value.trim();
      const price = document.getElementById('product-price').value.trim();
      const image = document.getElementById('product-image').value.trim();
      const description = document.getElementById('product-description').value.trim();
      
      if (editingProductId) {
        // UPDATE
        updateProduct(editingProductId, name, price, image, description);
      } else {
        // CREATE
        createProduct(name, price, image, description);
        showNotification('✓ ¡Producto añadido exitosamente!');
      }
      
      addProductForm.reset();
      clearProductFormErrors();
      scrollToElement('product-grid');
    }
  });
  
  // Real-time validation
  document.getElementById('product-name').addEventListener('blur', validateProductName);
  document.getElementById('product-price').addEventListener('blur', validateProductPrice);
  document.getElementById('product-image').addEventListener('blur', validateProductImage);
  document.getElementById('product-description').addEventListener('blur', validateProductDescription);
  
  // Payment form
  const paymentForm = document.getElementById('payment-form');
  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateCheckoutForm()) {
      const name = document.getElementById('checkout-name').value.trim();
      const email = document.getElementById('checkout-email').value.trim();
      
      document.getElementById('payment-message').textContent = 
        `¡Gracias, ${name}! Tu compra de ${total.toFixed(2)}€ ha sido procesada. Te enviaremos un correo a ${email}.`;
      
      paymentForm.reset();
      
      document.getElementById('checkout-name-error').textContent = '';
      document.getElementById('checkout-email-error').textContent = '';
      document.getElementById('checkout-address-error').textContent = '';
      document.getElementById('checkout-phone-error').textContent = '';
      
      setTimeout(() => {
        clearCart();
        document.getElementById('payment-message').textContent = '';
      }, 5000);
    }
  });
  
  document.getElementById('checkout-name').addEventListener('blur', validateCheckoutName);
  document.getElementById('checkout-email').addEventListener('blur', validateCheckoutEmail);
  document.getElementById('checkout-address').addEventListener('blur', validateCheckoutAddress);
  document.getElementById('checkout-phone').addEventListener('blur', validateCheckoutPhone);
  
  // Contact form
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateContactForm()) {
      const name = document.getElementById('contact-name').value.trim();
      
      document.getElementById('contact-success-message').textContent = 
        `¡Gracias, ${name}! Hemos recibido tu mensaje. Te responderemos pronto.`;
      
      contactForm.reset();
      
      document.getElementById('contact-name-error').textContent = '';
      document.getElementById('contact-email-error').textContent = '';
      document.getElementById('contact-subject-error').textContent = '';
      document.getElementById('contact-message-error').textContent = '';
      
      setTimeout(() => {
        document.getElementById('contact-success-message').textContent = '';
      }, 5000);
    }
  });
  
  document.getElementById('contact-name').addEventListener('blur', validateContactName);
  document.getElementById('contact-email').addEventListener('blur', validateContactEmail);
  document.getElementById('contact-subject').addEventListener('blur', validateContactSubject);
  document.getElementById('contact-message').addEventListener('blur', validateContactMessage);
  
  // Cart link
  const cartLink = document.getElementById(CART_LINK);
  cartLink.addEventListener('click', function(e) {
    e.preventDefault();
    showCart();
  });
});