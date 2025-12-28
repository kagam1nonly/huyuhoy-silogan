const btns = [
    {
        id: 1,
        name: 'Silog'
    },
    {
        id: 2,
        name: 'Breakfast'
    },
    {
        id: 3,
        name: 'Best Seller'
    }
];

const filters = [...new Set(btns.map((btn) => btn.name))];

document.getElementById('cat-btn').innerHTML = filters.map((name, index) => {
    const id = btns.find(btn => btn.name === name).id;
    return `
        <button class='fil-p' onclick='filterItems(${id})'>${name}</button>
    `;
}).join('');

const products = [
    {
        id: 1,
        image: '/static/food/imgs/sisilog.png',
        title: 'Sisilog',
        price: 99,
        category: 'Silog' 
    },
    {
        id: 1,
        image: '/static/food/imgs/Porksilog.png',
        title: 'Pork Silog',
        price:110,
        category: 'Silog'
    },
    {
        id: 1,
        image: '/static/food/imgs/bangsilog.png',
        title: 'Bang Silog',
        price: 80,
        category: 'Silog'
    },
    {
        id: 2,
        image: '/static/food/imgs/cornsilog.png',
        title: 'Corn Silog',
        price: 65,
        category: 'Breakfast'
    },
    {
        id: 1,
        image: '/static/food/imgs/tunasilog.png',
        title: 'Tuna Silog',
        price: 99,
        category: 'Silog'
    },
    {
        id: 2,
        image: '/static/food/imgs/spamsilog.png',
        title: 'Spam Silog',
        price: 110,
        category: 'Breakfast'
    },
    {
        id: 3,
        image: '/static/food/imgs/quarterpound.png',
        title: 'Quarterpound Beef Patty',
        price: 120,
        category: 'Best Seller'
    },
    {
        id: 3,
        image: '/static/food/imgs/porksteak.png',
        title: 'Pork Steak',
        price: 120,
        category: 'Best Seller'
    },
];

const categories = [...new Set(products.map((item) => item.category))];

const filterItems = (categoryId) => {
    const filteredProducts = products.filter(item => item.id === categoryId);
    displayItems(filteredProducts);
}

const displayItems = (items) => {
    document.getElementById('root').innerHTML = items.map((item) => {
        const { image, title, price } = item;
        return `
            <div class='box'>
                <h3>${title}</h3>
                <div class='img-box'>
                    <img class='images' src='${image}'></img>
                </div>
                <div class='bottom'>
                    <h2>₱${price}.00</h2>
                    <button class='add-btn' onclick="window.location.href='meal/'">ORDER NOW</button>
                </div>
            </div>`;
    }).join('');
}

displayItems(products);

