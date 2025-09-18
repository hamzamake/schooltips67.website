// Admin access using NGINX Basic Auth.
// No client-side password handling. We just navigate to a protected path.
// NGINX will return 401 and the browser shows the login prompt.
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('enterAdmin');
    if (!button) return;

    const protectedPath = button.dataset.path || '/admin/';
    button.addEventListener('click', () => {
        window.location.href = protectedPath;
    });
});