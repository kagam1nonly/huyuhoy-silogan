var cartItems = JSON.parse(localStorage.getItem('orders')) || [];
var total = localStorage.getItem('total');
var mcart = document.querySelector('#mcart');
var mtotal = document.querySelector('#mtotal');

// ADD MEAL 
function addMeal(mid) {
    var mealId = '#meal' + mid;
    var mealElement = document.querySelector(mealId);
    var mealName = mealElement.innerHTML;
    var mealImage = mealElement.previousElementSibling.src;

    var radio = 'mealOption' + mid;
    var selectedRadio = document.querySelector('input[name="' + radio + '"]:checked');

    if (!selectedRadio) {
        alert('Please select a meal option before adding to the cart.');
        return;
    }

    var price = parseFloat(selectedRadio.value);
    var rice = selectedRadio.value === "{{ meal.withRice }}" ? 'With Rice' : 'Without Rice';

    // Calculate and update the total price
    total = parseFloat(total) + price;

    var listItem = document.createElement('li');
    listItem.className = 'cart-item';
    listItem.innerHTML = '<img src="' + mealImage + '" alt="' + mealName + '" class="cart-item-image">' +
        '<div class="cart-item-details">' +
        '<p class="cart-item-name">' + mealName + '</p>' +
        '<p class="cart-item-price">₱' + price + '</p>' +
        '</div>' +
        '<button class="remove-button" onclick="removeMeal(this)">x</button>';

    mcart.appendChild(listItem);

    mtotal.innerHTML = 'Total: ₱' + total.toFixed(2);

    // Update the local storage
    cartItems.push({
        name: mealName,
        mealImageURL: mealImage,
        price: price,
    });
    localStorage.setItem('orders', JSON.stringify(cartItems));
    localStorage.setItem('total', total.toFixed(2));
    displayCart();
}


function displayCart() {
    var mcart = document.querySelector('#mcart');
    mcart.innerHTML = ''; 
    total = localStorage.getItem('total');

    for (let i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];

        var listItem = document.createElement('li');
        listItem.className = 'cart-item';
        listItem.innerHTML = '<img src="' + item.mealImageURL + '" alt="' + item.name + '" class="cart-item-image" width="125" height="125">' +
            '<div class="cart-item-details">' +
            '<p class="cart-item-name">' + item.name + '</p>' +
            '<p class="cart-item-price">₱' + item.price + '</p>' +
            '</div>' +
            '<button class="remove-button" onclick="removeMeal(' + i + ')">x</button>';

        mcart.appendChild(listItem);
    }
    mtotal.innerHTML = 'Total: ₱' + total;
    localStorage.setItem('orders', JSON.stringify(cartItems));
    localStorage.setItem('total', total);
    updateCartCount();
}

function removeMeal(m) {
    if (cartItems[m] && typeof cartItems[m].price === 'number') {
        total = Number(total) - Number(cartItems[m].price);
        cartItems.splice(m, 1);
        localStorage.setItem('orders', JSON.stringify(cartItems));
        localStorage.setItem('total', total.toFixed(2));
        displayCart();
    }
    else {
        console.log('ERROR POTA!');
    }
}

function updateCartCount() {
    var cart = document.querySelector("#cartCount");
    cart.innerHTML = cartItems.length;
}

// function removeItemFromCart(index) {
//     if (confirm("Do you want to remove this item from the cart?")) {
//         cartItems.splice(index, 1); // Remove the item at the specified index
//         updateLocalStorage(); // Update local storage
//         displayCart();
//         updateCartCount();
//     }
// }

 window.addEventListener('load', function () {
    displayCart();
    updateCartCount();
});