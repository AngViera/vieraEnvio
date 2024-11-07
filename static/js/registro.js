document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Quitar la clase 'active' de todas las pestañas y formularios
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.style.display = 'none');

            // Añadir la clase 'active' a la pestaña seleccionada
            this.classList.add('active');

            // Mostrar el formulario correspondiente
            if (this.id === 'cliente-tab') {
                document.getElementById('form-cliente').style.display = 'block';
            } else if (this.id === 'admin-tab') {
                document.getElementById('form-admin').style.display = 'block';
            } else if (this.id === 'login-tab') {
                document.getElementById('form-login').style.display = 'block';
            }
        });
    });
});
window.onload = function() {
    const alertDiv = document.getElementById('alert');
    
    // Mostrar la alerta si tiene contenido
    if (alertDiv && alertDiv.innerHTML.trim() !== '') {
        alertDiv.style.display = 'block'; // Muestra el div si hay un mensaje
    }

    // Escuchar el evento de input en el formulario para ocultar la alerta
    const form = document.querySelector('.form_login');
    form.addEventListener('input', function() {
        alertDiv.style.display = 'none'; // Oculta la alerta al escribir en el formulario
    });
};

