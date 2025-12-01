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
        image: 'media/meal_images/Sisilog.png',
        title: 'Sisilog',
        price: 85,
        category: 'Silog' // Make sure category names match
    },
    {
        id: 1,
        image: 'media/meal_images/Porksilog.png',
        title: 'Pork Silog',
        price: 95,
        category: 'Silog'
    },
    {
        id: 1,
        image: 'media/meal_images/Bangsilog.png',
        title: 'Bang Silog',
        price: 95,
        category: 'Silog'
    },
    {
        id: 1,
        image: 'media/meal_images/Chickensilog.png',
        title: 'Chicken Silog',
        price: 95,
        category: 'Silog'
    },
    {
        id: 1,
        image: 'media/meal_images/Cornsilog.png',
        title: 'Corn Silog',
        price: 95,
        category: 'Silog'
    },
    {
        id: 1,
        image: 'media/meal_images/Tunasilog.png',
        title: 'Tuna Silog',
        price: 95,
        category: 'Silog'
    },
    {
        id: 2,
        image: 'media/meal_images/Hungariansilog.png',
        title: 'Hungarian Silog',
        price: 90,
        category: 'Breakfast'
    },
    {
        id: 2,
        image: 'media/meal_images/Hamsilog.png',
        title: 'Ham Silog',
        price: 90,
        category: 'Breakfast'
    },
    {
        id: 2,
        image: 'media/meal_images/Spamsilog.png',
        title: 'Spam Silog',
        price: 90,
        category: 'Breakfast'
    },
    {
        id: 2,
        image: 'media/meal_images/Tocinosilog.png',
        title: 'Tocino Silog',
        price: 90,
        category: 'Breakfast'
    },
    {
        id: 3,
        image: 'media/meal_images/Quarterpound.png',
        title: 'Quarterpound Beef Patty',
        price: 90,
        category: 'Best Seller'
    },
    {
        id: 3,
        image: 'media/meal_images/Porksteak.png',
        title: 'Pork Steak',
        price: 90,
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
                    <button class='add-btn' onclick="window.location.href='meal/'">Order now</button>
                </div>
            </div>`;
    }).join('');
}

displayItems(products);

