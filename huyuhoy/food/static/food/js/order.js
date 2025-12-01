var cartItems = JSON.parse(localStorage.getItem('orders')) || [];
var total = localStorage.getItem('total');
var mcart = document.querySelector('#mcart');
var mtotal = document.querySelector('#mtotal');

// Migrate old localStorage paths from /media/meal_images/ to /static/food/imgs/
function migrateOldImagePaths() {
    var migrated = false;
    cartItems.forEach(function(item) {
        if (item.mealImageURL && item.mealImageURL.includes('/media/meal_images/')) {
            // Extract filename and version hash (e.g., "quarterpound_omqwEif.png" from "quarterpound_omqwEif.png")
            var parts = item.mealImageURL.split('/');
            var filename = parts[parts.length - 1];
            var baseFilename = filename.split('_')[0] + '.png'; // Remove version hash suffix
            
            // Map old filenames to new ones
            var fileMap = {
                'quarterpound_': 'quarterpound.png',
                'porksilog_': 'Porksilog.png',
                'bangsilog_': 'bangsilog.png',
                'cornsilog_': 'cornsilog.png',
                'tunasilog_': 'tunasilog.png',
                'spamsilog_': 'spamsilog.png',
                'sisilog_': 'sisilog.png',
                'porksteak_': 'porksteak.png'
            };
            
            // Find matching filename
            for (var key in fileMap) {
                if (filename.startsWith(key)) {
                    item.mealImageURL = '/static/food/imgs/' + fileMap[key];
                    migrated = true;
                    break;
                }
            }
        }
    });
    
    // Save migrated data back to localStorage
    if (migrated) {
        localStorage.setItem('orders', JSON.stringify(cartItems));
    }
}

// Run migration when page loads
migrateOldImagePaths(); 
function addMeal(mid, mealName, mealImageUrl, withRice, withOutRice) {
    var radio = 'mealOption' + mid;
    var selectedRadio = document.querySelector('input[name="' + radio + '"]:checked');

    if (!selectedRadio) {
        alert('Please select a meal option before adding to the cart.');
        return;
    }

    var price = parseFloat(selectedRadio.value);
    var rice = selectedRadio.value === withRice ? 'With Rice' : 'Without Rice';

    // Calculate and update the total price
    total = parseFloat(total) + price;

    var listItem = document.createElement('li');
    listItem.className = 'cart-item';
    listItem.innerHTML = '<img src="' + mealImageUrl + '" alt="' + mealName + '" class="cart-item-image">' +
        '<div class="cart-item-details">' +
        '<p class="cart-item-name">' + mealName + '</p>' +
        '<p class="cart-item-rice">(' + rice + ')</p>' +
        '<p class="cart-item-price">₱' + price.toFixed(2) + '</p>' +
        '</div>' +
        '<button class="remove-button" onclick="removeMeal(this)">x</button>';

    mcart.appendChild(listItem);

    mtotal.innerHTML = "Total: <div class='total'>₱" + total.toFixed(2) + "</div>";

    // Update the local storage
    cartItems.push({
        name: mealName,
        mealImageURL: mealImageUrl,
        rice: rice,
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
            '<p class="cart-item-rice">(' + item.rice + ')</p>' + 
            '<p class="cart-item-price">₱' + item.price + '.00</p>' +
            '</div>' +
            '<button class="remove-button" onclick="removeMeal(' + i + ')">x</button>';

        mcart.appendChild(listItem);
    }
    mtotal.innerHTML = "Total: <div class='total'>₱" + total + "</div>";

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
        console.log('Error potang!');
    }
}

function updateCartCount() {
    var cart = document.querySelector("#cartCount");
    cart.innerHTML = cartItems.length;
}

window.addEventListener('load', function () {
    displayCart();
    updateCartCount();
});

