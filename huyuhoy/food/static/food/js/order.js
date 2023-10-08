// Reset total to 0 on page load or refresh
localStorage.setItem('total', 0);

var pcart = document.querySelector('#pcart');
var ptotal = document.querySelector('#ptotal');
var total = localStorage.getItem('total');


function addMeal(mid) {
    mealId = '#meal' + mid;
    var name = document.querySelector(mealId).innerHTML;
    var radios = document.getElementsByName(mid);
    var selectedRadio = Array.from(radios).find(radio => radio.checked);
    
    // Check if a radio button is selected
    if (selectedRadio) {
        var price = parseFloat(selectedRadio.value) || 0;
    }

    var orders = JSON.parse(localStorage.getItem('orders')) || [];
    var cartSize = orders.length;
    // Saving item and total in localStorage
    orders[cartSize] = [name, price];
    localStorage.setItem('orders', JSON.stringify(orders));
    
    total = parseFloat(total) + price;
    localStorage.setItem('total', total);

    // Updating number of items in cart
    ptotal.innerHTML = 'Total: ' + '₱ ' + total;
    pcart.innerHTML += '<li>' + name + '<br>₱ ' + price + '</li>';
}

function shoppingCart() {
    var orders = JSON.parse(localStorage.getItem('orders')) || [];
    var total = localStorage.getItem('total');
    var cartSize = orders.length;
    pcart.innerHTML = '';

    for (let i = 0; i < cartSize; i++) {
        pcart.innerHTML += '<li>' + orders[i][0] + '<br>₱ ' + orders[i][1] + '</li>';
    }
    ptotal.innerHTML = 'Total: ' + '₱ ' + total;
}