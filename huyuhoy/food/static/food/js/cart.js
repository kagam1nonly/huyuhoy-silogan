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
    var total = localStorage.getItem('total');

    // Clear existing content
    img.innerHTML = '';
    nam.innerHTML = '';
    price.innerHTML = '';

    // Display item quantity
    var permanent = document.getElementById('permanent');
    permanent.innerHTML = `Item Quantity: ${cartItems.length}`;

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

        var mealRice = document.createElement('h3');
        mealRice.textContent = cartItem.rice;
        mealRice.classList.add('cart-item-rice'); 
        
        var mealPrice = document.createElement('h3');
        mealPrice.textContent = '₱' + cartItem.price;
        mealPrice.classList.add('cart-item-price'); 

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
        cartItemContainer.appendChild(mealRice);
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

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function order() {
    updateCartCount(); 
    var msg = note.value;
    var orders = localStorage.getItem('orders');
    var total = localStorage.getItem('total');
    var selectedTransaction = document.querySelector('.transaction-box.selected');
    var selectedPayment = document.querySelector('.payment-box.selected');

    if (!selectedTransaction) {
        alert('Please select a transaction type (Delivery or Pickup) before submitting your order.');
        return;
    }

    // Check if the selected transaction type is "Delivery" before checking payment
    if (selectedTransaction.textContent.trim().toLowerCase() === 'delivery' && selectedPayment) {
        var address = document.getElementById('addressInput').value;
        var paymentMethod = selectedPayment.getAttribute('data-payment-method');
    } else {
        var address = null;
        var paymentMethod = null;
    }

    console.log(selectedTransaction);
    console.log(selectedPayment);

    var url = '/food/order';
    var orderData = {};
    orderData['orders'] = orders;
    orderData['note'] = msg;
    orderData['bill'] = total;
    orderData['transaction'] = selectedTransaction.textContent.trim(); 
    orderData['address'] = address;
    orderData['payment_method'] = paymentMethod;

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
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
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

function selectTransaction(type) {
    var transactionBoxes = document.querySelectorAll('.transaction-box');
    var addressBox = document.getElementById('address-box');
    var paymentBox = document.getElementById('payment-box');
    var paym = document.getElementById('paym');

    // Remove the 'selected' class and reset background color from all boxes
    transactionBoxes.forEach(function (box) {
        box.classList.remove('selected');
        box.style.color = 'white';
        box.style.backgroundColor = ''; // Reset background color
    });

    // Find the clicked box and add the 'selected' class and set background color
    var selectedBox = document.querySelector('.' + type.toLowerCase());
    selectedBox.classList.add('selected');
    selectedBox.style.color = 'white';  
    selectedBox.style.backgroundColor = '#000';

    // Update selection message outside the boxes
    var selectionMessage = document.querySelector('.selection-message');
    //selectionMessage.innerHTML = 'Selected: <span class="type2">' + type.charAt(0).toUpperCase() + type.slice(1) + '</span>';


    if (type.toLowerCase() === 'delivery') {
        addressBox.style.display = 'block';
        paymentBox.style.display = 'block';
        paym.style.display = 'block';
    } else {
        addressBox.style.display = 'none';
        paymentBox.style.display = 'none';
        paym.style.display = 'none';
    }
}

function selectPayment(type) {
    var paymentBoxes = document.querySelectorAll('.payment-box');
    var paymText = document.getElementById('paym');

    // Remove the 'selected' class and reset background color from all boxes
    paymentBoxes.forEach(function (box) {
        box.classList.remove('selected');
        box.style.color = 'white';
        box.style.backgroundColor = ''; // Reset background color
    });

    // Find the clicked box and add the 'selected' class and set background color
    var selectedBox = document.querySelector('.' + type);
    selectedBox.classList.add('selected');
    selectedBox.style.color = 'white';  
    selectedBox.style.backgroundColor = '#000';

    // Update payment method text
    if (type === 'gcash') {
        paymText.textContent = 'GCash Payment';
    } else if (type === 'cod') {
        paymText.textContent = 'Cash on Delivery';
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

function gcashPay(orderNumber, event) {
    event.preventDefault();
    var loadingModal = document.querySelector(".loadingModal");
    var loader = document.querySelector(".loadingModal .loader");
    var emsg = document.querySelector(".loadingModal .e-msg");
    loadingModal.style.display = 'block';
    loadingModal.style.opacity = 1;
    loadingModal.style.transition = 'opacity 0.3s ease-in-out';
    loadingModal.style.pointerEvents = 'auto';
    loader.style.display = 'block';
    emsg.style.display = 'none';

    var amountElement = document.getElementById('amount' + orderNumber);
    var amount = amountElement.textContent.split(':')[1].trim();
    var refNumInput = document.querySelector('.ref-num[data-order-number="' + orderNumber + '"]');
    var refNum = refNumInput.value.trim();

    console.log('Sending amount:', amount);
    console.log('Sending ref_num:', refNum);
    console.log('Sending order_number:', orderNumber);

    if (refNum === '' || refNum.length < 13) {
        loader.style.display = 'none'; // Hide loader if there is an error
        emsg.innerHTML  = 'Please enter a valid reference number.';
        emsg.style.marginTop = '15px';
        emsg.style.display = 'block';
        setTimeout(function() {
            loadingModal.style.opacity = 0;
            loadingModal.style.pointerEvents = 'none';
            loadingModal.style.transition = 'opacity 0.6s ease-in-out';
        }, 5000);
        return;
    } else {
        loadingModal.style.opacity = 1;
        loadingModal.style.pointerEvents = 'auto';
        setTimeout(function () {
            loader.style.display = 'none'; // Hide loader after 3 seconds
            $.ajax({
                type: 'POST',
                url: '/process-gcash-payment/',
                data: {
                    'amount': amount,
                    'ref_num': refNum,
                    'order_number': orderNumber
                },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        console.log('Payment processed successfully');
                        emsg.innerHTML = 'Payment has been processed <i class="lni lni-checkmark-circle"></i>';
                        emsg.style.display = 'block';
                        emsg.style.marginTop = '15px';
                        emsg.style.marginRight = '25px';
                        setTimeout(function() {
                            loadingModal.style.opacity = 0;
                            loadingModal.style.pointerEvents = 'none';
                            loadingModal.style.transition = 'opacity 0.6s ease-in-out';
                        }, 4000);
                    } else {
                        console.error('Payment processing failed:', response.message);
                        emsg.innerHTML  = 'Payment processing failed. Please try again.';
                        emsg.style.display = 'block';
                        emsg.style.marginTop = '10px';
                        setTimeout(function() {
                            loadingModal.style.opacity = 0;
                            loadingModal.style.pointerEvents = 'none';
                            loadingModal.style.transition = 'opacity 0.6s ease-in-out';
                        }, 4000);
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                    console.error('Error processing payment:', error);
                    emsg.innerHTML  = 'Error processing payment. Please try again.';
                    emsg.style.display = 'block';
                    emsg.style.marginTop = '10px';
                    setTimeout(function() {
                        loadingModal.style.opacity = 0;
                        loadingModal.style.pointerEvents = 'none';
                        loadingModal.style.transition = 'opacity 0.6s ease-in-out';
                    }, 4000);
                }
            });
        }, 4500); 
    }
}

// Call displayCart on page load.
document.addEventListener("DOMContentLoaded", function () {
    // displayCart();
    updateCartCount(); // Make sure cart count is updated on page load
    var submitButton = document.querySelector('.submit-button');
    
    // Check if the "order" function is not already defined in the HTML
    if (typeof submitButton.onclick !== 'function') {
        submitButton.addEventListener('click', order);
    }

    document.querySelectorAll('.modal-background').forEach(function (modalBackground) {
        modalBackground.addEventListener('click', function (event) {
            console.log('Click on Modal Background');
            var orderNumber = modalBackground.getAttribute('data-order-number');
            if (orderNumber) {
                console.log(orderNumber);
                hideModal(orderNumber);
            } else {
                console.log("Error nub");
                console.log(orderNumber);
            }
        });
    });
});

