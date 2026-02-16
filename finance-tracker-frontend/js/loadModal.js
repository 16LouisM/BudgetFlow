// js/loadModal.js
function loadModal(modalPath, containerId, callback) {
  fetch(modalPath)
    .then(response => {
      if (!response.ok) throw new Error('Modal not found');
      return response.text();
    })
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
      if (callback) callback(); // Initialize modal functionality after loading
    })
    .catch(error => console.error('Modal loading error:', error));
}