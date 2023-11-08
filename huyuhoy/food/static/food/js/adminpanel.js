const modal = document.getElementById("messageModal");
const closeModal = document.getElementById("closeModal");
const background = document.querySelector(".modal-background"); // Add this

closeModal.onclick = function () {
    modal.style.display = "none";
    background.style.display = "none"; 
}

if (messages && !localStorage.getItem("modalClosed")) {
    modal.style.display = "block";
    background.style.display = "block"; // Show the background
    background.onclick = function (e) {
        if (e.target === background) {
            modal.style.display = "none";
            background.style.display = "none";
        }
    }
};
