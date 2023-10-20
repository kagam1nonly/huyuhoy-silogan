let cartItems = JSON.parse(localStorage.getItem('orders')) || [];
let total = localStorage.getItem('total');

try {
    let total = parseFloat(localStorage.getItem('total')) || 0;
    // Your code that uses 'total' here
} catch (error) {
    console.error('Error while handling total:', error);
}

// Function to add an item to the cart
function addItemToCart(item) {
    cartItems.push(item);
    updateCartDisplay();
    updateLocalStorage();
    updateCartCount(); // Update the cart count
}


function removeItemFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        const item = cartItems[index];
        removeItemFromServer(item.id); // Send a DELETE request to the server
    }
}

// Function to update the cart display
function updateCartDisplay() {
    const cartList = document.getElementById("cart-items");
    cartList.innerHTML = "";

    cartItems.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="cart-item">
                <img src="${item.mealImageURL}" alt="${item.name}" class="cart-item-image" width="100" height="100">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">₱${item.price}</p>
                </div>
                <button onclick="removeItemFromCart(${index})">Remove</button>
            </div>
        `;
        cartList.appendChild(listItem);
    });
}


// Function to send a removal request to the server
function removeItemFromServer(itemId) {
    const csrfToken = getCSRFToken(); // Implement this as needed

    fetch(`/food/remove_item_from_cart/${itemId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
        .then((response) => {
            if (response.ok) {
                // Handle a successful removal response
                // You can also remove the item from the client-side cart
                cartItems = cartItems.filter(item => item.id !== itemId);
                updateCartDisplay();
                updateLocalStorage();
                updateCartCount(); // Update the cart count
            } else {
                // Handle the error case
                console.error('Error removing item:', response.status, response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

updateCartDisplay();

// Function to update localStorage with cartItems
function updateLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(cartItems));
}

// Function to get the CSRF token as needed
function getCSRFToken() {
    // Get the CSRF token from the HTML DOM
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

// Function to update the cart count
function updateCartCount() {
    var cartCount = cartItems.length;
    document.getElementById('cartCount').textContent = cartCount;
}

// Function to toggle the cart container's visibility
function toggleCart() {
    var cartContainer = document.querySelector('.cart-container');
    if (cartContainer.style.display === 'block' || cartContainer.style.display === '') {
        cartContainer.style.display = 'none'; // Hide the cart container
    } else {
        cartContainer.style.display = 'block'; // Show the cart container
    }
}

// Call the initCart function when the document is ready
document.addEventListener("DOMContentLoaded", function () {

    updateCartDisplay();
    updateOrderContainer();
    // Call the initCart function to toggle the cart container's visibility
    toggleCart();

    // Function to toggle the cart container's visibility
    function initCart() {
        // Attach a click event handler to the "#cart" link in the navbar
        var cartLink = document.querySelector('a[href="#cart"]');
        if (cartLink) {
            cartLink.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent the link from navigating
                toggleCart(); // Toggle the visibility of the cart container
            });
        }
    }

    // Call the initCart function when the document is ready
    initCart();
});

// Initialize the cart display

function updateOrderContainer() {
    const orderContainer = document.querySelector(".order-container");
    const orderHeader = document.createElement("div");
    orderHeader.classList.add("order-header");

    // Define the order header columns
    const imageColumn = document.createElement("div");

    const nameColumn = document.createElement("div");

    const priceColumn = document.createElement("div");
    // Append the columns to the header
    orderHeader.appendChild(imageColumn);
    orderHeader.appendChild(nameColumn);
    orderHeader.appendChild(priceColumn);

    // Clear the existing content in the order container
    orderContainer.innerHTML = "";

    // Append the header to the order container
    orderContainer.appendChild(orderHeader);

    // Iterate over the cart items and add them to the order container
    cartItems.forEach((item) => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("order-item");

        const image = document.createElement("div");
        image.classList.add("order-item-image");
        image.innerHTML = `<img src="${item.mealImageURL}" alt="${item.name}" width="100" height="100">`;

        const name = document.createElement("div");
        name.classList.add("order-item-name");
        name.textContent = item.name;

        const price = document.createElement("div");
        price.classList.add("order-item-price");
        price.textContent = `₱${item.price}`;

        // Append the image, name, and price to the order item
        orderItem.appendChild(image);
        orderItem.appendChild(name);
        orderItem.appendChild(price);

        // Append the order item to the order container
        orderContainer.appendChild(orderItem);
    });
}
