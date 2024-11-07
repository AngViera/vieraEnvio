document.addEventListener('DOMContentLoaded', () => {
    // Verificar si 'tienda' es indefinido
    const nombreElement = document.getElementById('nombre');
    const isNewTienda = (nombreElement && nombreElement.textContent.trim() === "Nombre") ? true : false;
window.addEventListener('load', function() {
            const headerImage = document.getElementById('headerImage');
            const innerImage = document.getElementById('innerImage');
            headerImage.classList.add('fade-out');
            if (isNewTienda) {
                innerImage.style.filter = 'blur(5px)';
            }
            checkIfNewTienda();
            cargarProductosRelacionados();
            extenderButtons();
        });
function checkIfNewTienda() {
    // Verificar si la tienda es nueva
    if (isNewTienda) {
        // Nombre
        var nombreH1 = document.getElementById('nombre');
        var nombreInput = `<input id="nombreInput" type="text" class="${nombreH1.className}" value="${nombreH1.innerText}" />`;
        nombreH1.outerHTML = nombreInput;

        // select para categoria
       agregarSelectCategorias();

        // Reemplazar la descripcion
        var descripcionSpan = document.getElementById('descripcionContent');
        var descripcionInput = `<textarea id="descripcionInput" class="menu-datos" rows="5">${descripcionSpan.innerText}</textarea>`;
        descripcionSpan.outerHTML = descripcionInput;

        // Reemplazar la direccion
        var direccionSpan = document.getElementById('direccionContent');
        var direccionInput = `<input id="direccionInput" type="text" class="menu-datos" value="${direccionSpan.innerText}" />`;
        direccionSpan.outerHTML = direccionInput;

        // Reemplazar el NIT
        var nitSpan = document.getElementById('nitContent');
        var nitInput = `<input id="nitInput" type="text" class="menu-datos" value="${nitSpan.innerText}" />`;
        nitSpan.outerHTML = nitInput;
    }
}

function cargarProductosRelacionados() {
    const nombre = nombreElement.textContent;
    console.log(nombre); // Nombre de la tienda para filtrar los productos

    fetch(`/productos_menu?Etiquetas=${encodeURIComponent(nombre)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // Indicar que es una solicitud AJAX
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        const thumbnails = document.getElementById('thumbnails');
        thumbnails.innerHTML = ''; 

        let productosFiltrados = data.productos.filter(producto => producto.estado !== 0);  // Filtrar solo productos activos

        if (productosFiltrados.length === 0) {
            // Comprobar si la tienda es nueva
            if (nombre === "Nombre") { 
                // Crear y agregar cards si la tienda es undefined
                const productos = [
                    { img: 'static/img/preview.jpg', nombre: 'Producto 1', precio: '$$$' },
                    { img: 'static/img/preview.jpg', nombre: 'Producto 2', precio: '$$$' }
                ];

                // Crear un documento fragment para mejorar el rendimiento
                const fragment = document.createDocumentFragment();

                productos.forEach(producto => {
                    const figura = document.createElement('figure');
                    figura.classList.add('card');

                    const img = document.createElement('img');
                    img.src = producto.img;
                    img.alt = producto.nombre;
                    figura.appendChild(img);

                    const nombreCard = document.createElement('h3');
                    nombreCard.classList.add('nombre');
                    nombreCard.textContent = producto.nombre;
                    figura.appendChild(nombreCard);

                    const precioCard = document.createElement('h3');
                    precioCard.classList.add('price-text');
                    precioCard.textContent = producto.precio;
                    figura.appendChild(precioCard);

                    // Añadir la figura al fragmento
                    fragment.appendChild(figura);
                });

                // Añadir todas las cards al contenedor de una vez
                thumbnails.appendChild(fragment);
            }
        } else {
            productosFiltrados.forEach(producto => {
                const figura = document.createElement('figure');
                figura.classList.add('card');
                figura.setAttribute('data-id', producto.id);
                figura.setAttribute('data-images', producto.imagesurl);

                const img = document.createElement('img');
                img.src = `/static/img/${producto.imagesurl[0]}`; 
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

                const comprar = document.createElement('button');
                comprar.classList.add('btn-primary');
                comprar.textContent = 'Comprar';
                figura.appendChild(comprar);

                comprar.addEventListener('click', () => {
                    mostrarModal(producto); // funcion para mostrar el modal
                });

                const botoncarro = document.createElement('button');
                botoncarro.classList.add('boton-carro');
                const icono = document.createElement('i');
                icono.className = 'fa-solid fa-shopping-cart'; //Icono de supermercado
                icono.setAttribute('aria-hidden', 'true');
                botoncarro.appendChild(icono);
                figura.appendChild(botoncarro);

                thumbnails.appendChild(figura);
            });
        }
    })
    .catch(error => {
        console.error('Error en la búsqueda de productos:', error);
    });
}

//Funciones agregar nueva tienda
let cropper;
const cropButton = document.getElementById('cropButton');
const cropImageButton = document.getElementById('cropImageButton');
const imageInput = document.getElementById('imageInput');
const cerrarCrop = document.getElementById('closecrop');
const modal = document.getElementById('cropModal');
const innerImage = document.getElementById('innerImage');

if (cropButton) {
    cropButton.addEventListener('click', function() {
        modal.style.display = 'block';
        modal.style.zIndex = '10'; //Sobreponer modal
    });

    cerrarCrop.addEventListener('click', function() {
        modal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });

    imageInput.addEventListener('change', loadImage);

    cropImageButton.addEventListener('click', function() {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas({
                height: 350 // Altura fija de la imagen recortada
            });

            // Reemplazar la imagen en #innerImage con el DataURL de la imagen recortada
            innerImage.src = croppedCanvas.toDataURL('image/jpeg');

            // Convertir el canvas a Blob
            croppedCanvas.toBlob(function(blob) {
                if (blob) {
                    window.croppedBlob = blob;

                    modal.style.display = 'none';
                } else {
                    console.error('No se pudo crear el Blob del canvas.');
                }
            }, 'image/jpg'); 
        }
    });

    function loadImage(event) {
        const input = event.target;
        if (input.files && input.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const cropperImage = document.getElementById('cropperImage');
                cropperImage.src = e.target.result;
                cropperImage.style.display = 'block';
                initializeCropper(cropperImage);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function initializeCropper(image) {
        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(image, {
            aspectRatio: 16 / 7,
            viewMode: 1,
            height: 350,
        });
    }
// Función para crear FormData y enviar al host 
function guardarTienda() {
    const formData = new FormData();

    // Obtener los valores de los campos modificados
    const nombre = document.getElementById('nombreInput').value;
    const direccion = document.getElementById('direccionInput').value;
    const nit = document.getElementById('nitInput').value;
    const descripcion = document.getElementById('descripcionInput').value;

    // Obtener el valor del select de categorias
    const categoriaSelect = document.getElementById('categoriaSelect');
    const idCategoria = categoriaSelect.options[categoriaSelect.selectedIndex].value;

    // Obtener los archivos del input de icono
    const inputIcon = document.getElementById('inputIcon');
    if (inputIcon.files.length > 0) {
        formData.append('Icono', inputIcon.files[0]);
    }

    // Agregar el Blob del banner
    if (window.croppedBlob) {
        formData.append('Banner', window.croppedBlob, 'banner.jpg');
    } else {
        console.error('No hay Blob de banner disponible.');
    }

    // Llenar el FormData con los campos
    formData.append('Nombre', nombre);
    formData.append('Direccion', direccion);
    formData.append('Descripcion', descripcion);
    formData.append('ID_Categoria', idCategoria);

    const estado = true; 
    formData.append('Estado', estado);

    return formData; // Devuelve el FormData para usarlo en otra función
}

// Enviar a ruta de insertar tienda en py
function enviarData() {
    const formData = guardarTienda();

    fetch('/insertar_tienda', {
        method: 'POST',
        body: formData,
        headers: {
            // No establezcas el Content-Type manualmente al usar FormData
            // 'Content-Type': 'multipart/form-data'  // No lo incluyas
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Aquí puedes manejar la respuesta del servidor
        console.log(data);
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: data.message,
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un problema al insertar la tienda.',
        });
    });
}

//Vista previa en submenus
inputIcon.addEventListener('change', function(event) {
    const input = event.target;
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const iconUrl = e.target.result; // URL de la imagen cargada
            const nombreInput = document.getElementById('nombreInput').value;  
            const descripcionInput = document.getElementById('descripcionInput').value;  

            // Eliminar el último tienda-card si existe
            const existingCard = document.querySelector('.tienda-card');
            if (existingCard) {
                existingCard.remove(); // Remover el elemento anterior
            }

            // Crear el nuevo tienda-card
            const cardTemplate = `
                <div class="tienda-card">
                    <img src="${iconUrl}" alt="Icono Nuevo Restaurante" />
                    <div class="info">
                        <div class="card-title">
                            <h3>${nombreInput}</h3>
                        </div>
                        <div class="card-description">${descripcionInput}</div>
                    </div>
                    <div class="container"><button class="btn-secondary escoger-icono">Escoger otro icono</button></div>
                </div>
            `;

            const cardsContainer = document.getElementById('card-container');
            cardsContainer.insertAdjacentHTML('beforeend', cardTemplate);

            // Mostrar el botón de icono
            document.getElementById('iconButton').style.display = 'none'; 
            
            const nuevoBoton = cardsContainer.querySelector('.escoger-icono');
            nuevoBoton.addEventListener('click', function() {
                // Mostrar el botón de icono
                document.getElementById('iconButton').style.display = 'block';

                // Remover el tienda-card al cambiar icono
                const tiendaCard = nuevoBoton.parentElement; 
                tiendaCard.remove(); 
            });
        };

        reader.readAsDataURL(file);
        
    }   
});
//termina la funcion
}// termina el if

//Obtener datos producto
var modalProducto = document.getElementById('modalProducto');
var productoSet = document.getElementById('productoset');
let currentIndex = 0;

function mostrarModal(producto) {

    const contenidoModal = document.getElementById('contenidoModal');
    contenidoModal.innerHTML = ''; 

    const nombre = document.createElement('h1');
    nombre.textContent = producto.nombre;

    const precio = document.createElement('h2');
    precio.textContent = `Precio: $${producto.precio.toLocaleString('en-US')}`;

    const descripcion = document.createElement('p');
    descripcion.textContent = producto.descripcion;

    const carousel = document.createElement('div');
    carousel.classList.add('carousel-center');

    // Crear imagenes del producto
    const images = producto.imagesurl;
    images.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = `/static/img/${url}`;
        img.alt = producto.nombre;
        img.style.display = index === currentIndex ? 'block' : 'none'; // Mostrar solo la imagen actual
        carousel.appendChild(img);
    });

    // Agregarr botones de navegación
    const prevIcon = document.createElement('i');
    prevIcon.className = 'fa-solid fa-chevron-left'; // Icono de flecha izquierda
    prevIcon.onclick = () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        actualizarCarrusel(carousel, images);
    };

    const nextIcon = document.createElement('i');
    nextIcon.className = 'fa-solid fa-chevron-right'; // Icono de flecha derecha
    nextIcon.onclick = () => {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        actualizarCarrusel(carousel, images);
    };


    contenidoModal.appendChild(nombre);
    contenidoModal.appendChild(precio);
    contenidoModal.appendChild(carousel);
    contenidoModal.appendChild(descripcion);
    carousel.appendChild(prevIcon);
    carousel.appendChild(nextIcon);
    productoSet.style.width = '500px';
    modalProducto.style.display = 'block'; 
}


document.getElementById('closemodal').addEventListener('click', () => {
    modalProducto.style.display = 'none';
});
// Mostrar submenu
const toggleinfo = document.getElementById('toggleInfo');
const toggleButton = document.getElementById('toggleButton');
const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');

//Botones expansibles
function extenderButtons() {
if (isNewTienda) {
    toggleButton.style.display = 'none';
    toggleinfo.textContent = 'Agregar Informacion';
    // Crear un nuevo boton para guardar la tienda
    var saveButton = document.createElement('button');
    saveButton.classList.add('btn-primary');
    saveButton.textContent = 'Guardar tienda';
    saveButton.addEventListener('click',function(event){
        enviarData();
        guardarTienda();
    }    );

    // Agregar el nuevo botón al div contenedor
    div1.appendChild(saveButton);
} else {
    toggleButton.addEventListener('click', function() {
        // Cambiar la visibilidad con fadein
        if (div2.classList.contains('show')) {
            div2.classList.remove('show');
            toggleButton.classList.add('active');
            // Mostrar div2 antes de la transición
            setTimeout(function() {
                div2.classList.remove('show');
            }, 100); 
            this.textContent = 'Ver horarios';
        } else {
            div2.classList.add('show');
            toggleButton.classList.remove('active');
            setTimeout(function() {
                div2.classList.add('show');
            }, 100);
            this.textContent = 'Ocultar';
        }
    });
}
}
// Ocultar el toggleButton
if(toggleinfo){
    toggleinfo.classList.remove('active');
    toggleinfo.setAttribute('href', '#datatienda');
    }
// Funcion para obtener las categorías de la ruta y llenar el select
function agregarSelectCategorias() {
    const categoriaDiv = document.getElementById('categoria');
    
    categoriaDiv.innerHTML = ''; 

    // Crear el select
    const select = document.createElement('select');
    select.id = 'categoriaSelect';
    select.className = 'menu-categoria';

    fetch('/get_categorias')
        .then(response => response.json())
        .then(data => {
            data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.ID_Categoria;
                option.textContent = cat.Nombre;
                
                if ("{{ tienda }}" && "{{ tienda.ID_Categoria }}" == cat.ID_Categoria) {
                    option.selected = true;
                }

                select.appendChild(option);
            });

            categoriaDiv.appendChild(select);
        })
        .catch(error => console.error('Error al cargar las categorías:', error));
}
//Imagenes en el modal de compra
function actualizarCarrusel(carousel, images) {
    const imgs = carousel.querySelectorAll('img');
    imgs.forEach((img, index) => {
        img.style.display = index === currentIndex ? 'block' : 'none';
    });
}
});
 