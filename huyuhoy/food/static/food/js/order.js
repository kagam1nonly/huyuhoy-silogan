// Initialize total as a number
localStorage.setItem('total', 0);

var pcart = document.querySelector('#pcart');
var ptotal = document.querySelector('#ptotal');

function addMeal(mid, mealImageURL) {
    mealId = '#meal' + mid;
    var name = document.querySelector(mealId).textContent;
    var radios = document.getElementsByName(mid);
    var selectedRadio = Array.from(radios).find(radio => radio.checked);

    if (selectedRadio) {
        var price = parseFloat(selectedRadio.value) || 0;
    }

    var orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Store a unique identifier along with the item details
    var uniqueId = Date.now().toString();
    orders.push({ id: uniqueId, name, price, mealImageURL });

    localStorage.setItem('orders', JSON.stringify(orders));

    localStorage.setItem('cartCount', orders.length);

    var total = parseFloat(localStorage.getItem('total')) || 0;
    total += price;
    localStorage.setItem('total', total);

    updateCartCount();

    // Update the cart content immediately
    shoppingCart();
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
