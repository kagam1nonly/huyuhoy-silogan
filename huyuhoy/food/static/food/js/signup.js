document.addEventListener('DOMContentLoaded', function() {
    let map, marker;

    function initMap() {
        map = L.map('map').setView([7.0768, 125.6071], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([7.0768, 125.6071], { draggable: true }).addTo(map);

        marker.on('dragend', function(e) {
            console.log('Marker dragged to:', e.target.getLatLng());
            updateAddressField(e.target.getLatLng());
        });
    }

    // Add form submission event listener
    const form = document.getElementById('registration-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Check if the form is valid
        if (form.checkValidity()) {
            // Submit the form
            form.submit();

            // Show the success alert
            showSuccessAlert();
        } else {
            // Display the validation errors
            form.reportValidity();
        }
    });

    function showSuccessAlert() {
        // Show a simple JavaScript alert
        alert('Account created successfully!');
    }

    function openMap() {
        document.getElementById('map').style.display = 'block';
        initMap();
    }

    function updateAddressField(position) {
        console.log('Updating address field with position:', position);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const addressField = document.getElementById('id_address');
                const address = `${data.address.road || ''}, ${data.address.city || ''}`;
                addressField.value = address.trim();
                console.log('Address field updated:', addressField.value);
            })
            .catch(error => {
                console.error('Error fetching address:', error);
                window.alert('No results found');
            });
    }



    const mapButton = document.querySelector('.btn-map');
    mapButton.addEventListener('click', openMap);
});
