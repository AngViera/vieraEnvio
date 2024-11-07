document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const thumbnails = document.getElementById('thumbnails');
    const searchInput = document.getElementById('filtronav');

    //Script para Abrir Menu de Filtros
    var botonPrecio = document.getElementById('boton-precio');
    var botonDesplegable = document.getElementById('boton-dropdown');
    var menuDesplegable = document.getElementById('menu-categorias');
    var menuPrecio = document.getElementById('menu-precio');
    const filters = document.querySelectorAll('.dropdown-item input[type="checkbox"]');


botonDesplegable.addEventListener('click', function() {
    const botonRect = botonDesplegable.getBoundingClientRect(); 
    menuDesplegable.classList.toggle('show');

    // Calcular la posición en funcion de la pantalla
    const top = botonRect.top + window.scrollY + botonDesplegable.offsetHeight;
    const left = botonRect.left + window.scrollX;

    // Aplicar las propiedades 'inset' de manera dinámica
    menuDesplegable.style.setProperty('inset', `${top}px auto auto ${left}px`);
});

botonPrecio.addEventListener('click', function() {
    const botonRect = botonPrecio.getBoundingClientRect(); 
    menuPrecio.classList.toggle('show');

    // Calcular la posición en funcion de la pantalla
    const top = botonRect.top + window.scrollY + botonPrecio.offsetHeight;
    const left = botonRect.left + window.scrollX;

    menuPrecio.style.setProperty('inset', `${top}px auto auto ${left}px`);
});

     const precioBarra = document.querySelector('.custom-range');

    precioBarra.addEventListener('input', () => {
    const value = precioInput.value;
    const max = precioInput.max;
    
    const position = (value / max) * 100;

    precioInput.style.setProperty('--thumb-position', `${position}%`);
});
     //Filtrar Precio
     let claseMostrada = false;
     const precioInput = document.getElementById('precioInput');
     const precioInputValue = document.getElementById('precioInputValue');
     precioInput.addEventListener('input', () => {
     const precioInt = Number(precioInput.value);
    
    // Agregar millares al filtro precio
    if (!isNaN(precioInt)) {
        precioInputValue.textContent = `$${precioInt.toLocaleString('en-US')}`;
    }

    if (!claseMostrada) {
        precioInputValue.classList.add('show'); //Evita transision agresiva
        claseMostrada = true; 
    }
});
    //Script para obtener/mostrar Categorias
    const categoryFilters = document.getElementById('category-filters');

    // Función para obtener categorías desde el backend
            function loadCategories() {
                fetch('/get_categorias')
                    .then(response => response.json())
                    .then(categories => {
                        const categoryHtml = categories.map(cat => `
                            <div class="custom-checkbox-container">
                            <div class="custom-checkbox">
                                <input type="checkbox" value="${cat.ID_Categoria}" id="tipo-${cat.ID_Categoria}">
                                <label for="tipo-${cat.ID_Categoria}"></label>
                            </div>
                            <label for="tipo-${cat.ID_Categoria}">${cat.Nombre}</label>
                        </div>
                        `).join('');
                        categoryFilters.innerHTML = categoryHtml;
                    })
                    .catch(error => console.error('Error cargando categorías:', error));
            }
            loadCategories();


    document.addEventListener('click', function(event) { //Ocultar Dropdown menu por defecto
        if (!botonDesplegable.contains(event.target) && !menuDesplegable.contains(event.target)) {
            menuDesplegable.classList.remove('show');
        }
    });
function cargarProductosActivos() {
    const query = searchInput ? searchInput.value : '';
    const queryParams = new URLSearchParams(query);

    fetch(`/buscar?${queryParams}`
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar productos activos');
            }
            return response.json();
        })
        .then(data => {
            thumbnails.innerHTML = ''; 

            const noResultsDiv = document.getElementById('no-results');

            // Aplicar filtro de estado para asegurarse de que solo se muestren productos activos (estado = 1)
            productosFiltrados = productosFiltrados.filter(producto => producto.estado !== 0);

            if (productosFiltrados.length > 0) {
                noResultsDiv.classList.remove('show'); 
                productosFiltrados.forEach(producto => {
                    const figura = document.createElement('figure');
                    figura.classList.add('card');
                    figura.setAttribute('data-id', producto.id);
                    figura.setAttribute('data-images', producto.imagesurl);

                    const img = document.createElement('img');
                    img.src = `static/img/${producto.imagesurl[0] || 'preview.jpg'}`; // Usar preview.jpg si no hay imagen
                    img.alt = producto.nombre;
                    figura.appendChild(img);
                    img.addEventListener('click', function() {
                    window.location.href = `/producto/${producto.id}`;
                    });

                    const nombre = document.createElement('h3');
                    nombre.classList.add('nombre');
                    nombre.textContent = producto.nombre;
                    figura.appendChild(nombre);

                    const precio = document.createElement('h3');
                    precio.classList.add('price-text');
                    precio.textContent = `$${producto.precio.toLocaleString('en-US')}`;
                    figura.appendChild(precio);

                    const btnContainer = document.createElement('div');
                    btnContainer.classList.add('text-center');

                    const btnComprar = document.createElement('button');
                    btnComprar.classList.add('btn', 'btn-primary');
                    btnComprar.textContent = 'Comprar';
                    btnContainer.appendChild(btnComprar);

                    figura.appendChild(btnContainer);
                    thumbnails.appendChild(figura);
                });
            } else {
                noResultsDiv.classList.add('show'); 
            }
        }))
        .catch(error => {
            console.error('Error al cargar productos activos:', error);
        });
}
    let noResultsMessage = null; 

    function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked'); 
    return Array.from(checkboxes).map(checkbox => checkbox.value); 
}

    
function NoResults() {
    thumbnails.innerHTML = '';  // Limpiar resultados anteriores

    const noResultsMessage = document.createElement('div');
    noResultsMessage.className = 'thumbnail fade-in show';

    const h2 = document.createElement('h2');
    h2.textContent = 'Sin resultados, intente un criterio más simple';
    h2.className = 'text-center';

    noResultsMessage.appendChild(h2);
    thumbnails.appendChild(noResultsMessage);

    setTimeout(() => {
        noResultsMessage.classList.add('show');
    }, 10);
}


    

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = searchInput.value;
            const categoria = getSelectedCategories();
            buscarProductos(query);
        }
    });

function buscarProductos(query, categorias) {
    const precioMaximo = precioInput.value; // Obtener el valor del rango de precio

    let queryParams = new URLSearchParams();
    
    // Agregar el parámetro de búsqueda si existe
    if (query) {
        queryParams.append('q', encodeURIComponent(query));
    }

    // Agregar las categorías seleccionadas si existen
    if (categorias && categorias.length > 0) {
        categorias.forEach(categoria => {
            queryParams.append('categoria', categoria);
        });
    }

    // Agregar el filtro de precio máximo si es válido
    if (precioMaximo && precioMaximo < 10000000) {
        queryParams.append('precioMaximo', precioMaximo);
    }

    // Construir la URL con los parámetros
    const url = `/buscar?${queryParams.toString()}`;

    // Realizar la solicitud HTTP
    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest' // Indica que es una solicitud AJAX
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok');
        }
        return response.json();
    })
    .then(data => {
        const thumbnails = document.getElementById('thumbnails');
        thumbnails.innerHTML = ''; // Limpiar el contenedor de resultados
        const noResultsDiv = document.getElementById('no-results');
        let productosFiltrados = data.productos;

        // Filtrar por categorías si hay alguna seleccionada
        if (categorias && categorias.length > 0) {
            productosFiltrados = productosFiltrados.filter(producto => categorias.includes(producto.categoria));
        }

        // Filtrar por precio máximo si está definido
        if (precioMaximo && precioMaximo < 10000000) {
            productosFiltrados = productosFiltrados.filter(producto => producto.precio <= precioMaximo);
        }

        if (productosFiltrados.length > 0) {
            noResultsDiv.classList.remove('show');  
            productosFiltrados.forEach(producto => {
                const figura = document.createElement('figure');
                figura.classList.add('card');
                figura.setAttribute('data-id', producto.id);
                figura.setAttribute('data-images', producto.imagesurl);

                const img = document.createElement('img');
                img.src = `static/img/${producto.imagesurl[0] || 'preview.jpg'}`; // Usar preview.jpg si no hay imagen
                img.alt = producto.nombre;
                figura.appendChild(img);
                img.addEventListener('click', function() {
                    window.location.href = `/producto/${producto.id}`;
                    });

                const nombre = document.createElement('h3');
                nombre.classList.add('nombre');
                nombre.textContent = producto.nombre;
                figura.appendChild(nombre);

                const precio = document.createElement('h3');
                precio.classList.add('price-text');
                precio.textContent = `$${producto.precio.toLocaleString('en-US')}`;
                figura.appendChild(precio);

                const btnContainer = document.createElement('div');
                btnContainer.classList.add('text-center');

                const btnComprar = document.createElement('button');
                btnComprar.classList.add('btn', 'btn-primary');
                btnComprar.textContent = 'Comprar';
                btnContainer.appendChild(btnComprar);

                figura.appendChild(btnContainer);
                thumbnails.appendChild(figura);
            });
        } else {
            noResultsDiv.classList.add('show');  
        }
    })
    .catch(error => {
        console.error('Error en la búsqueda:', error);
    });
}

searchButton.addEventListener('click', function() {
    const query = searchInput ? searchInput.value : '';
    const categorias = getSelectedCategories();  // Obtener las categorías seleccionadas
    buscarProductos(query, categorias);
})



    const sticker = document.getElementById('sticker');
    
//Manejo de busqueda manual o por redireccion
    function handleInitialSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            const categoria = getSelectedCategories();
            performSearch(query, categoria);
        }
    }

    
});
