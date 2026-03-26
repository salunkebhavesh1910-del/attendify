function showLoading() {
  const dashboard = document.getElementById('dashboardContent');
  if (dashboard) dashboard.innerHTML = '<div class="loading">Loading...</div>';
}

function showNotification(message, type = 'info') {
  alert(message);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}