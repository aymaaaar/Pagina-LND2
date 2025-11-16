let cart = [];
let total = 0;

function addToCart(itemName, price) {
    cart.push({ name: itemName, price: price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartLink = document.getElementById('cart-link');
    const cartTotal = document.getElementById('cart-total');

    cartItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - $${item.price}`;
        cartItems.appendChild(li);
    });

    cartLink.textContent = `Carrito (${cart.length})`;
    cartTotal.textContent = total;
    document.getElementById('checkout-total').textContent = total;

    document.getElementById('cart').style.display = 'block';
}

function clearCart() {
    cart = [];
    total = 0;
    updateCart();
    document.getElementById('cart').style.display = 'none';
    document.getElementById('checkout').style.display = 'none';
}

function showCart() {
    document.getElementById('cart').style.display = 
        document.getElementById('cart').style.display === 'none' ? 'block' : 'none';
}

function showCheckout() {
    if (cart.length > 0) {
        document.getElementById('cart').style.display = 'none';
        document.getElementById('checkout').style.display = 'block';
    } else {
        alert('Tu carrito está vacío.');
    }
}

document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    if (name && email && address) {
        document.getElementById('payment-message').textContent = 
            `Gracias, ${name}! Tu compra de $${total} ha sido procesada. Te enviaremos un correo a ${email}.`;
        document.getElementById('payment-form').reset();
        clearCart();
    } else {
        document.getElementById('payment-message').textContent = 'Por favor, completa todos los campos.';
    }
});

document.getElementById('cart-link').addEventListener('click', function(e) {
    e.preventDefault();
    showCart();
});
