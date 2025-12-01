var hours = 24;
var now = Date.now();
var stepTime = localStorage.getItem('stepTime');

if (stepTime == null) {
    localStorage.setItem('stepTime', now);
} else {
    if (now - stepTime > hours * 60 * 60 * 1000) {
        localStorage.clear();
        localStorage.setItem('stepTime', now);
    }
}

var orders = localStorage.getItem('orders');
var total = localStorage.getItem('total');

if (orders === null || orders === undefined) {
    orders = [];
    localStorage.setItem('orders', JSON.stringify(orders));
} else {
    orders = JSON.parse(orders);
}

if (total === null || total === undefined) {
    total = 0;
    localStorage.setItem('total', total);
}

var cart = document.querySelector("#cartCount");
cart.innerHTML = orders.length;
