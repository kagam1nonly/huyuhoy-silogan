document.querySelectorAll('.accept-button, .refuse-button, .delete-button, .complete-button').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form submission
        const form = event.target.closest('form');
        const orderStatus = event.target.closest('tr').querySelector('.status').textContent.trim();
        const action = form.querySelector('input[name="action"]').value;

        if (action === 'Accept' && orderStatus !== 'Pending') {
            alert(`You can only accept orders with a "Pending" status. This order has a status of "${orderStatus}".`);
        } else if (action === 'Refuse' && (orderStatus !== 'Pending' && orderStatus !== 'Processing')) {
            alert(`You can only refuse orders with a "Pending" or "Processing" status. This order has a status of "${orderStatus}".`);
        } else if (action === 'Delete' && orderStatus !== 'Canceled') {
            alert(`This order cannot be deleted because its status is "${orderStatus}".`);
        } else if (action === 'Complete' && orderStatus !== 'Processing') {
            alert(`You can only complete orders with an "Processing" status. This order has a status of "${orderStatus}".`);
        } else {
            if (action === 'Accept' || action === 'Refuse' || action === 'Complete' || action === 'Delete') {
                if (confirm(`Are you sure you want to ${action.toLowerCase()} this order?`)) {
                    submitOrderForm(form); // Rename the first submitForm
                }
            }
        }
    });
});

// Renamed the first submitForm to submitOrderForm
function submitOrderForm(form) {
    fetch(`/adminpanel-order/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: new URLSearchParams(new FormData(form))
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.error || 'An error occurred. Please try again later.');
            });
        }
    })
    .then(data => {
        if (data.message) {
            alert(data.message);
            window.location.reload();  // Reload the page to reflect changes
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
}

// Renamed the second submitForm to submitPaymentForm
// function submitPaymentForm(form) {
//     fetch('/adminpanel-payment/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
//         },
//         body: new URLSearchParams(new FormData(form))
//     })
//     .then(response => response.json())  // Parsing the JSON response
//     .then(data => {
//         if (data.message) {
//             alert(data.message);  // Display success message
//             window.location.reload();  // Reload the page to reflect changes
//         } else if (data.error) {
//             alert(data.error);  // Display error message
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('An error occurred. Please try again later.');
//     });
// }