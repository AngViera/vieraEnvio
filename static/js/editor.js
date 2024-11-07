document.addEventListener('DOMContentLoaded', () => {
    const productosDiv = document.getElementById('productos');
    let selectedProductId;
    const EstadoInput = document.getElementById('Estado');

// Almacenar el ID del producto
    function openDeleteModal(productId) {
    selectedProductId = productId; 
    document.getElementById('deleteModal').style.display = 'block';
    }

   async function obtenerProductos() {
    try {
        const response = await fetch('/productos');
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        const data = await response.json();  // Obtener lista JSON del servidor
        mostrarProductos(data.productos);  
    } catch (error) {
        console.error('Error:', error);
    }
}
    // Cargar Productos en preview individual
function mostrarProductos(productos) {
    const contenedorProductos = document.getElementById('productos');
    contenedorProductos.innerHTML = ''; 

    // Obtener el valor del select para el estado
    const estadoSelect = document.getElementById('Estado');
    const mostrarInactivos = estadoSelect.value === '0'; // true si se deben mostrar inactivos

    // Filtrar productos según el estado
    const productosFiltrados = productos.filter(producto => {
        // Si EstadoSelect = 1, solo mostrar activos
        if (estadoSelect.value === '1') {
            return producto.estado !== 0; // Solo activos
        } else {
            return true; // Mostrar todos, incluidos los inactivos
        }
    });

    // Mostrar productos filtrados
    productosFiltrados.forEach(producto => {
        const figura = document.createElement('figure');
        figura.classList.add('card');

        // Agregar la clase inactive para productos agotados
        if (producto.estado === 0) {
            figura.classList.add('inactive');
        }
        figura.setAttribute('data-id', producto.id);
        figura.setAttribute('data-images', producto.imagesurl);

        const img = document.createElement('img');
        img.src = `static/img/${producto.imagesurl[0]}`;
        img.alt = producto.nombre;
        figura.appendChild(img);

        const nombre = document.createElement('h3');
        nombre.classList.add('nombre');
        nombre.textContent = producto.nombre;
        figura.appendChild(nombre);

        const precio = document.createElement('h3');
        precio.classList.add('price-text');
        precio.textContent = `$${producto.precio.toLocaleString('en-US')}`;
        figura.appendChild(precio);

        const btnContainer = document.createElement('div');
        btnContainer.classList.add('btn-container');

        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn-primary');
        btnEditar.textContent = 'Editar';
        btnContainer.appendChild(btnEditar);

        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn-delete');
        btnEliminar.textContent = 'Quitar';
        btnContainer.appendChild(btnEliminar);

        figura.appendChild(btnContainer);

        // Agregar event listener al boton de editar
        btnEditar.addEventListener('click', function() {
            const cardElement = this.closest('.card');
            const productoId = cardElement.dataset.id;
            const productoNombre = cardElement.querySelector('.nombre').textContent;
            const productoPrecio = cardElement.querySelector('.price-text').textContent;

            cargarImages(cardElement);

            document.getElementById('editProductName').value = productoNombre;
            document.getElementById('editProductPrice').value = productoPrecio.replace('$', '').replace(/,/g, '');

            editarModal.style.display = 'block';
            const activateButton = document.getElementById('activateProduct');
            if (producto.Estado === 0) {
                activateButton.style.display = 'block'; // Mostrar el botón "Activar"
                activateButton.dataset.id = producto.id; // Almacenar el ID del producto
                activateButton.onclick = () => activarProducto(producto.id);
            } else {
                activateButton.style.display = 'none'; // Ocultar el boton si no es necesario
            }
            document.getElementById('saveEdit').dataset.id = productoId;
        });

        // Agregar event listener al boton de eliminar
        btnEliminar.addEventListener('click', function() {
            const productoId = this.closest('.card').dataset.id;
            const productoNombre = this.closest('.card').querySelector('.nombre').textContent;
            const productoImageUrl = this.closest('.card').querySelector('img').src;

            modalProductName.textContent = productoNombre;
            modalProductId.textContent = `ID: ${productoId}`;
            document.getElementById('modalProductImage').src = productoImageUrl;
            modalProductName.textContent = `"${productoNombre}"`;
            descontinuar.dataset.id = productoId;
            deleteModal.style.display = 'block';
        });

        contenedorProductos.appendChild(figura);
    });

    if (productosFiltrados.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.textContent = 'No se encontraron productos que coincidan con la busqueda.';
        contenedorProductos.appendChild(mensaje);
    }
}

EstadoInput.addEventListener('change', () => {
    obtenerProductos(); 
});

obtenerProductos();

//Funciones de borrado :)
const deleteModal = document.getElementById('deleteModal');
const modalProductName = document.getElementById('modalProductName');
const descontinuar = document.getElementById('descontinuar');
const desactivar = document.getElementById('desactivar');
const closeModal = document.getElementById('closeModal');
const cancelar = document.getElementById('cancelar');

// Cerrar el modal
closeModal.addEventListener('click', function() {
    deleteModal.style.display = 'none';
});

cancelar.addEventListener('click', function() {
    deleteModal.style.display = 'none';
});

desactivar.addEventListener('click', function() {
    const productId = descontinuar.dataset.id; // Obtener el ID del producto desde el botón de confirmar

    Swal.fire({
            title: '¿Estás seguro?',
            text: "Marcar el Producto Actual como agotado",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff8f46',
            cancelButtonColor: '#fb2525',
            confirmButtonText: 'Confirmar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {{

        fetch(`/cambiar_estado/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al desactivar el producto');
            }
            return response.json();
        })
        .then(data => {
        })
        .catch(error => {
            alert(error.message); 
        });
    }
                console.log('Producto desactivado.');
                
                Swal.fire({
                            title: 'Producto desactivado',
                            text: 'El producto ha sido marcado como agotado.',
                            icon: 'info',
                            confirmButtonColor: '#ff8f46'
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            } else {
                console.log('Desactivación cancelada.');
            }
        });
    });

descontinuar.addEventListener('click', function() {
        const productId = descontinuar.dataset.id; // Obtener el ID del producto desde el botón de confirmar
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta accion desactivara el producto para todos los clientes",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#fb2525',
            cancelButtonColor: '#ff8f46',
            confirmButtonText: 'Confirmar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/delete_producto/${productId}`, {
                    method: 'DELETE',
                })
                .then(data => {
                console.log('Producto Oculto.');
                Swal.fire({
                    title: 'Producto Oculto',
                    text: 'El producto ha sido descontinuado.',
                    icon: 'error',
                    confirmButtonColor: '#fb2525'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire(
                        'Error',
                        'Ocurrió un problema al ocultar el producto.',
                        'error'
                    );
                });
            } 
        });
    });
//Funciones de edicion
const  editarModal = document.getElementById("editarModal");
const  cerrarEdit = document.getElementById("cancelEdit");
const  saveEdit = document.getElementById("saveEdit");

cerrarEdit.addEventListener('click', function() {
    editarModal.style.display = 'none';
});

function cargarImages(cardElement) {
    const currentImagesContainer = document.getElementById('currentImages');
    currentImagesContainer.innerHTML = ''; 

    const imagenesActuales = cardElement.dataset.images.split(','); 

    imagenesActuales.forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = `static/img/${imgUrl.trim()}`; 
        img.alt = 'Imagen del producto';
        img.classList.add('image-mini');

        const contenedorConBoton = agregarBotonEliminar(img);
        currentImagesContainer.appendChild(contenedorConBoton);
    });
}

let filesArray = []; 
let imageMap = new Map(); 

    function agregarImagenes(input) {
        const currentImagesContainer = document.getElementById('currentImages');

        if (input.files) { //Validacion de imagenes
            Array.from(input.files).forEach(file => {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = 'Nueva Imagen';
                img.classList.add('image-mini');

                filesArray.push(file);
                imageMap.set(img.src, file);

                const contenedorConBoton = agregarBotonEliminar(img);
                currentImagesContainer.appendChild(contenedorConBoton);
            });
        }
    }

saveEdit.addEventListener("click", function() {
        const currentImagesContainer = document.getElementById('currentImages');
        const imagenes = currentImagesContainer.getElementsByTagName('img');
        
        const filenames = Array.from(imagenes).map(img => {
            const src = img.src;

            if (src.startsWith('blob:')) {
                const file = imageMap.get(src); 
                return file ? file.name : ''; // Retornar el nombre o vacío si no existe 
                //{la ruta backend usa secure_filename para rechazar archivos invalidos}
            } else {
                return src.split('/').pop(); 
            }
        }).join(';');

        document.getElementById('imageFilenames').value = filenames;
        console.log(filenames);
        //Enviar Datos a request
        const productId = this.dataset.id; // Obtener el ID del producto desde el atributo del boton
    
        const nombre = document.getElementById("editProductName").value;
        const precio = document.getElementById("editProductPrice").value;
        const descripcion = document.getElementById("editProductDescription").value;
        const etiquetas = document.getElementById("editProductTags").value;
        const imagesurl = document.getElementById('imageFilenames').value.split(';');

    fetch(`/editar_producto/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre: nombre,
            precio: precio,
            descripcion: descripcion,
            etiquetas: etiquetas,
            imagesurl: imagesurl
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al editar el producto');
        }
        return response.json();
    })
    .then(data => {
                console.log('Cambios Guardados.'); //Alert confirmando el guardado
                Swal.fire({
                    title: 'Producto Guardado',
                    text: 'El producto ha sido editado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#ff8f46'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            })
    .catch(error => {
        console.error(error);
        alert('Hubo un error al guardar los cambios.');
    });
});

document.getElementById('closeEditModal').addEventListener('click', function() {
    editarModal.style.display = 'none';
});

function agregarBotonEliminar(imagen) {
    const contenedor = document.createElement('div');
    contenedor.style.position = 'relative'; 

    const img = imagen.cloneNode();
    contenedor.appendChild(img);

    // Crear botón de eliminar
    const btnQuitar = document.createElement('button');
    btnQuitar.textContent = 'Eliminar';
    btnQuitar.classList.add('btn-delete');
    btnQuitar.style.position = 'absolute'; // Posicionar el botón sobre la imagen
    btnQuitar.style.top = '50%'; 
    btnQuitar.style.left = '50%'; 
    btnQuitar.style.transform = 'translate(-50%, -50%)'; // Ajustar posición


    btnQuitar.addEventListener('click', function() {
        contenedor.remove(); 
    });

    contenedor.appendChild(btnQuitar);
    return contenedor; //
}

document.getElementById('file-upload').addEventListener('change', function(event) {
    agregarImagenes(event.target);
});

// Función para activar el producto
function activarProducto(productId) {
    fetch(`/activar_producto/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            estado: 1 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al activar el producto');
        }
        return response.json();
    })
    .then(data => {
                console.log('Producto Activado'); //Alert confirmando el guardado
                Swal.fire({
                    title: 'Producto Activado!',
                    text: 'El producto ha sido marcado como disponible.',
                    icon: 'success',
                    confirmButtonColor: '#ff8f46'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            })
    .catch(error => {
        console.error(error);
        alert('Hubo un error al guardar los cambios.');
    });
}
//Buscador heredado
document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('filtronav').value;

    fetch(`/buscar?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest' // Indica que es una solicitud AJAX
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        mostrarProductos(data.productos); 
    })
    .catch(error => {
        console.error('Error en la búsqueda:', error);
    });
});


});
