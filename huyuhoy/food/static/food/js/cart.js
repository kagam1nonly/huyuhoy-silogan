// Initialize cart count on page load
updateCartCount();

// Call the updateCartContainer function to initially populate the cart container
updateCartContainer();

var name = document.querySelector("#name");
var price = document.querySelector("#price");
var bill = document.querySelector("#ptotal");

function shoppingCart() {
    var orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Get a reference to the "order-container" element
    var orderContainer = document.querySelector(".order-container");

    // Clear the existing content in the order container
    orderContainer.innerHTML = '';

    orders.forEach(function (order, index) {
        var name = order.name;
        var price = order.price;
        var imageSrc = order.mealImageURL;

        // Create a new row element for the order item
        var newRow = document.createElement("div");
        newRow.className = "order-row";

        // Create columns for Image, Name, Price, and Remove button
        var imageColumn = document.createElement("div");
        imageColumn.className = "order-column";
        var mealImage = document.createElement("img");
        mealImage.src = imageSrc;
        mealImage.alt = name;
        mealImage.style.width = "15%"; // Set the image width
        imageColumn.appendChild(mealImage);

        var nameColumn = document.createElement("div");
        nameColumn.className = "order-column";
        nameColumn.textContent = name;

        var priceColumn = document.createElement("div");
        priceColumn.className = "order-column";
        priceColumn.textContent = "₱ " + price.toFixed(2);

        var removeColumn = document.createElement("div");
        removeColumn.className = "order-column";
        var removeButton = document.createElement("button");
        removeButton.className = "del";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", function () {
            removeItemFromCart(index);
        });

        // Append columns to the row
        newRow.appendChild(imageColumn);
        newRow.appendChild(nameColumn);
        newRow.appendChild(priceColumn);
        newRow.appendChild(removeColumn);
        removeColumn.appendChild(removeButton);

        // Append the row to the order container
        orderContainer.appendChild(newRow);
    });

    // Calculate and display the total
    var total = orders.reduce(function (sum, order) {
        return sum + order.price;
    }, 0);
    bill.textContent = 'Total: ₱ ' + total.toFixed(2);
}

shoppingCart();




// Function to toggle the cart container's visibility
function toggleCart() {
    var cartContainer = document.querySelector('.cart-container');
    if (cartContainer.style.display === 'block' || cartContainer.style.display === '') {
        cartContainer.style.display = 'none'; // Hide the cart container
    } else {
        cartContainer.style.display = 'block'; // Show the cart container
    }
}

function updateCartContainer() {
    // Retrieve orders and total from localStorage
    var orders = JSON.parse(localStorage.getItem('orders')) || [];
    var total = parseFloat(localStorage.getItem('total')) || 0;

    // Get references to the cart list and total elements in the cart container
    var pcart = document.querySelector('.cart-list');
    var ptotal = document.querySelector('.cart-total h5.title-1');

    // Clear the existing content in the cart list
    pcart.innerHTML = '';

    // Loop through the orders and populate the cart list
    for (let i = 0; i < orders.length; i++) {
        var button = '<button class="del" onclick="removeItemFromCart(' + i + ')">Remove</button>';
        var name = orders[i].name; // Get the meal name
        var price = orders[i].price; // Get the meal price
        var mealImageURL = orders[i].mealImageURL; // Get the meal image URL

        pcart.innerHTML += `
            <li>
                <img src="${mealImageURL}" alt="${name}" class="cart-image">
                ${name} ₱${price} ${button}
            </li>
        `;
    }

    // Update the total displayed in the cart container
    ptotal.textContent = 'Total: ₱ ' + total.toFixed(2); // Format total as currency
}


function clearCart() {
    // Clear the cart items and update the cart count and total
    localStorage.removeItem('orders');
    localStorage.setItem('total', 0);
    localStorage.setItem('cartCount', 0);

    // Clear the cart list and total display
    var pcart = document.querySelector('.cart-list');
    var ptotal = document.querySelector('.cart-total h5.title-1');
    pcart.innerHTML = '';
    ptotal.textContent = 'Total: ₱ 0.00';

    // Update the cart count displayed in the navbar
    updateCartCount();
}

// Update this code in your removeItemFromCart function
function removeItemFromCart(index) {
    var orders = JSON.parse(localStorage.getItem('orders')) || [];
    var total = parseFloat(localStorage.getItem('total')) || 0;

    if (index < orders.length) {
        total -= orders[index].price;
        orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('total', total);

        // Update the cart count
        localStorage.setItem('cartCount', orders.length);

        // Use AJAX to inform the server to remove the item
        // Example AJAX code using the fetch API
        fetch('/remove_item', {
            method: 'POST',
            body: JSON.stringify({ index: index }),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken() // Add a function to get the CSRF token
            }
        }).then(function(response) {
            if (response.ok) {
                // The item was successfully removed from the server
                // Now, update the cart and cart container without a page reload
                updateCartContainer();
                shoppingCart();
            }
        });
    }
}

// Function to update the cart count
function updateCartCount() {
    var cartCount = localStorage.getItem('cartCount') || 0;
    document.getElementById('cartCount').textContent = cartCount;
}

// Call the initCart function when the document is ready
document.addEventListener("DOMContentLoaded", function () {
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
