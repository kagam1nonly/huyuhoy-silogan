var cartItems = JSON.parse(localStorage.getItem('orders')) || [];
var total = localStorage.getItem('total');
var img = document.querySelector('#meal-img')
var nam = document.querySelector('#meal-name')
var price = document.querySelector('#meal-price')
var rmv = document.querySelector('#rmv')
var bill = document.querySelector('#ototal')

//mealImage.innerHTML = '<img src="' + item.mealImageURL + '" alt="' + item.name + '" width="125" height="125">';
//'<button class="remove-button" onclick="removeMeal(' + i + ')">Remove</button>';

function displayCart() {
    var cartItems = JSON.parse(localStorage.getItem('orders')) || [];
    var total = localStorage.getItem('total');

    // Clear existing content
    img.innerHTML = '';
    nam.innerHTML = '';
    price.innerHTML = '';

    for (let i = 0; i < cartItems.length; i++) {
        var cartItem = cartItems[i];

        // Create a container div for each cart item
        var cartItemContainer = document.createElement('div');
        cartItemContainer.classList.add('cart-item-container');

        // Create an image element
        var mealImage = document.createElement('img');
        mealImage.src = cartItem.mealImageURL;
        mealImage.alt = cartItem.name;
        mealImage.width = 125;
        mealImage.height = 125;
        mealImage.classList.add('cart-item-image'); // Add a class to the image

        // Create h3 elements for meal name and price
        var mealName = document.createElement('h3');
        mealName.textContent = cartItem.name;
        mealName.classList.add('cart-item-name'); // Add a class to the meal name

        var mealPrice = document.createElement('h3');
        mealPrice.textContent = '₱' + cartItem.price;
        mealPrice.classList.add('cart-item-price'); // Add a class to the meal price

        // Create a remove button
        var rmvButton = document.createElement('div');
        rmvButton.textContent = 'x';
        rmvButton.className = 'remove-btn';
        rmvButton.onclick = function() {
            removeMeal(i);
        };

        // Append elements to the container in the desired order
        cartItemContainer.appendChild(rmvButton);
        cartItemContainer.appendChild(mealImage);
        cartItemContainer.appendChild(mealName);
        cartItemContainer.appendChild(mealPrice);

        // Append the cart item container to their respective containers
        img.appendChild(cartItemContainer);
    }

    // Update the total and cart count display
    bill.innerHTML = 'Total: ₱' + total;
    updateCartCount();
}


function removeMeal(m) {
    if (cartItems[m] && typeof cartItems[m].price === 'number') {
        console.log('Before subtraction: bill =', total);
        console.log('Item price =', cartItems[m].price);
        total -= parseFloat(cartItems[m].price); // Update the bill variable
        console.log('After subtraction: bill =', total);
        cartItems.splice(m, 1);
        localStorage.setItem('orders', JSON.stringify(cartItems));
        localStorage.setItem('total', total.toFixed(2)); // Store the updated bill in local storage
        displayCart(); // Update the cart display
    } else {
        console.log('ERROR POTA!');
    }
}

function updateCartCount() {
    var cart = document.querySelector("#cartCount");
    cart.innerHTML = cartItems.length;
}

var note = document.querySelector('#note');

function order() {
    updateCartCount(); 
    var msg = note.value;
    var orders = localStorage.getItem('orders');
    var total = localStorage.getItem('total')
    var url = '/food/order';
    var orderData = {};
    orderData['orders'] = orders;
    orderData['note'] = msg;
    orderData['bill'] = total;
    
    // Check if orders are empty
    if (orders === null || orders === '[]') {
        alert('Your cart is empty. Please add items to your cart before submitting your order.');
        return;
    }
    
    if (confirm('Are you sure you want to submit your order?')) {
        $.ajax({
            url: url,
            type: "POST",
            data: orderData,
            success: function(data) {
                window.location.replace('/food/success')
                localStorage.setItem('orders', JSON.stringify([]));
                localStorage.setItem('total', 0);
                console.log(orders);
                console.log(msg);
            }
        })
    }
}



function cancelOrder(orderNumber) {
    if (confirm("Are you sure you want to cancel this order?")) {
        // Make an AJAX request to cancel the order on the server
        // You can use JavaScript or a JavaScript framework (e.g., jQuery) for the AJAX request
        // After successfully canceling the order, you can remove the corresponding order box from the DOM
        // Example using jQuery:
        $.post("/cancel-order/", { order_number: orderNumber }, function(data) {
            if (data.success) {
                // Remove the order box from the DOM
                const orderBox = document.querySelector(".order-box");
                orderBox.parentNode.removeChild(orderBox);
            } else {
                alert("Failed to cancel the order.");
            }
        });
    }
}

// Call displayCart on page load.
document.addEventListener("DOMContentLoaded", function () {
    displayCart();
    updateCartCount(); // Make sure cart count is updated on page load
    var submitButton = document.querySelector('.submit-button');
    
    // Check if the "order" function is not already defined in the HTML
    if (typeof submitButton.onclick !== 'function') {
        submitButton.addEventListener('click', order);
    }
});
