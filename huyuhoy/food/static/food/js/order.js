    //localStorage.setItem('total', 0);
    var cartItems = JSON.parse(localStorage.getItem('orders')) || [];

    var pcart = document.querySelector('#pcart');
    var ptotal = document.querySelector('#ptotal');

    function addToCart(mid) {
        var meal_id = parseInt(mid);
        console.log('meal_id:', mid);
        var mealOption = document.querySelector('input[name="mealOption"]:checked');
        var selectedRadio = mealOption ? mealOption.value : null;

        var mealDataElement = document.getElementById("meal-data");
        var mealName = mealDataElement.getAttribute("data-meal-name");
        var mealImageURL = mealDataElement.getAttribute("data-meal-image");

        if (selectedRadio) {
            var price = parseFloat(selectedRadio) || 0;
        }

        // Create an object representing the item to be added to the cart
        var item = {
            id: generateUniqueId(), // Generate a unique identifier for the item
            name: mealName, // Set the actual name of the item
            price: price,
            mealImageURL: mealImageURL, // Set the actual image URL
            // Add any other properties you need to describe the item
        };

        // Add the item to the client-side cart
        addCartItem(item);
        console.log('Item added to cart:', item); // Add this line for debugging


        // Store the updated cart in local storage
        updateLocalStorage();

        // Send an AJAX request to add the meal to the cart on the server
        sendAddToCartRequest(item, meal_id);
    }

    function generateUniqueId() {
        // Implement a function to generate a unique identifier for cart items
        // You can use a timestamp, a random number, or a combination of both
        return Date.now() + '-' + Math.random().toString(36).substring(2);
    }

    function addCartItem(item) {
        // Add the item to the client-side cart (cartItems array)
        cartItems.push(item);

        // Update the cart display
        updateCartDisplay();

        // Update the cart count
        updateCartCount();
    }

    function updateLocalStorage() {
        // Store the updated cart in local storage
        localStorage.setItem('orders', JSON.stringify(cartItems));
        console.log('Cart items:', cartItems); // Add this line for debugging
    console.log('Local Storage Orders:', localStorage.getItem('orders')); // Add this line for debugging
    }

    function sendAddToCartRequest(item, meal_id) {
        // Get the CSRF token from the HTML DOM
        var csrfToken = getCSRFToken();
        
        // Send an AJAX request to add the item to the cart on the server
        fetch('/food/add_to_cart/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // Include the CSRF token in the header
            },
            body: JSON.stringify({
                meal_id: meal_id,
                quantity: 1, // You can include the quantity in the request
                // Include other data as needed to add the item to the server-side cart
            }),
        });
    }
    

    function updateCartDisplay() {
        const cartList = document.getElementById("pcart");
        const orderTotal = document.getElementById("order-total");
    
        cartList.innerHTML = "";
        orderTotal.innerHTML = ""; // Clear the previous content
    
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
    
            // Display the item in the order-total section
            const orderItem = document.createElement("div");
            orderItem.innerHTML = `
                <div class="order-item">
                    <img src="${item.mealImageURL}" alt="${item.name}" width="100" height="100">
                    <div class="order-item-details">
                        <p class="order-item-name">${item.name}</p>
                        <p class="order-item-price">₱${item.price}</p>
                    </div>
                    <button onclick="removeItemFromCart(${index})">Remove</button>
                </div>
            `;
            orderTotal.appendChild(orderItem);
        });
    }
    

    function getCSRFToken() {
        // Get the CSRF token from the HTML DOM
        console.log(csrfToken);
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    function shoppingCart() {
        var orders = JSON.parse(localStorage.getItem('orders')) || [];
        var total = parseFloat(localStorage.getItem('total')) || 0;

        if (pcart && ptotal) {
            pcart.innerHTML = '';

            orders.forEach(item => {
                if (item && typeof item === 'object') {
                    const { id, name, price, mealImageURL } = item;

                    const itemElement = document.createElement('li');
                    itemElement.innerHTML = `
                        <img src="${mealImageURL}" alt="${name}" class="cart-image">
                        ${name} ₱${price} 
                        <button class="del" data-uniqueId="${id}">x</button>
                    `;

                    itemElement.querySelector('.del').addEventListener('click', () => {
                        removeMeal(id);
                    });

                    pcart.appendChild(itemElement);
                } else {
                    console.error('Invalid item:', item);
                }
            });

            ptotal.innerHTML = 'Total: ₱' + total;
            updateCartCount();
        }
    }



    function removeMeal(uniqueId) {
        var orders = JSON.parse(localStorage.getItem('orders')) || [];
        var total = parseFloat(localStorage.getItem('total')) || 0;

        // Find the item with the matching unique identifier and remove it
        var itemIndex = orders.findIndex(item => item.id === uniqueId);

        if (itemIndex !== -1) {
            total -= orders[itemIndex].price;
            orders.splice(itemIndex, 1);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('total', total);

            // Update the cart count
            localStorage.setItem('cartCount', orders.length);

            // Update the cart display after removing the meal
            shoppingCart();
        }
    }

    function updateCartCount() {
        var cartCount = localStorage.getItem('cartCount') || 0;
        document.getElementById('cartCount').textContent = cartCount;
    }

    // Initialize cart count on page load
    updateCartCount();

    // Call shoppingCart on page load to display initial cart content
    shoppingCart();

    document.getElementById('pcart').addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('del')) {
            var uniqueId = event.target.getAttribute('data-uniqueId');
            removeMeal(uniqueId);
        }
    });

    function initializeOrdersInLocalStorage() {
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([])); // Initialize as an empty array
        }
    }
    
    // Call the initialization function when the page loads
    initializeOrdersInLocalStorage();