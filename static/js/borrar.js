document.addEventListener('DOMContentLoaded', () => {
const carouselContainer = document.getElementById('carousel-container');
const images = document.querySelectorAll('#carousel-container .carousel-cell img');
const totalImages = images.length;
let loadedImages = 0;

// Obtener el ID del producto actual desde la URL
const urlParts = window.location.pathname.split('/');
const productId = urlParts[urlParts.length - 1]; 

function checkAllImagesLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        carouselContainer.style.display = 'block'; 
        
        new Flickity('.carousel', {
            cellAlign: 'left',
            contain: true,
            wrapAround: true,
            pageDots: false,
            prevNextButtons: true 
        });
    }
}

images.forEach(img => {
    img.addEventListener('load', checkAllImagesLoaded);
    img.addEventListener('error', () => {
        console.error('Error loading image:', img.src);
        checkAllImagesLoaded(); 
    });
});

if (totalImages === 0) {
    loadingMessage.style.display = 'none';
    carouselContainer.style.display = 'block';
    
    new Flickity('.carousel', {
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
    });
}

//Scroll de productos similares
const thumbnails = document.getElementById('getSimilar');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

btnPrev.addEventListener('click', () => {
    thumbnails.scrollBy({
        top: 0,
        left: -220, // Ajusta según el tamaño de tus tarjetas
        behavior: 'smooth'
    });
});

btnNext.addEventListener('click', () => {
    thumbnails.scrollBy({
        top: 0,
        left: 220, // Ajusta según el tamaño de tus tarjetas
        behavior: 'smooth'
    });
});

const getProduct = document.getElementById('getID');
const productoId = getProduct.dataset.id;


    fetch(`/buscar_similares/${productoId}`)
        .then(response => response.json())
        .then(data => {
            thumbnails.innerHTML = ''; // Limpiar el contenedor

            if (data.productos_similares.length > 0) {
                data.productos_similares.forEach(producto => {
                    const figura = document.createElement('figure');
                    figura.classList.add('card');
                    figura.setAttribute('data-id', producto.id);

                    const img = document.createElement('img');
                    img.src = `/static/img/${producto.imagesurl[0] || 'preview.jpg'}`;
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

                    thumbnails.appendChild(figura);
                });
            } else {
                thumbnails.innerHTML = '<p>No se encontraron productos similares.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    //Funciones Borrar
    const deleteButton = document.getElementById('borrar');
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelar = document.getElementById('cancelar');
    const desactivar = document.getElementById('desactivar');
    const descontinuar = document.getElementById('descontinuar');


    deleteButton.addEventListener('click' , function() {
        deleteModal.style.display = "block";
    });

    closeModal.addEventListener('click', function() {
        deleteModal.style.display = "none";
    });
    cancelar.addEventListener('click', function() {
        deleteModal.style.display = "none";
    });

        //Marcar como agotado
    desactivar.addEventListener('click', function() {
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
                            text: 'El producto ha sido desactivado.',
                            icon: 'info',
                            confirmButtonColor: '#ff8f46'
                });
            } else {
                console.log('Desactivación cancelada.');
            }
        });
    });

    descontinuar.addEventListener('click', function() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Descontinuar este producto",
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
                console.log('Producto descontinuado.');
                Swal.fire({
                    title: 'Producto descontinuado',
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
                        'Ocurrió un problema al descontinuar el producto.',
                        'error'
                    );
                });
            } 
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            deleteModal.style.display = "none";
        }});

    const comprar = document.getElementById('comprar');
    const comprarModal = document.getElementById('comprarModal');
    const cancelar2 = document.getElementById('cancelar2');

    comprar.addEventListener('click' , function() {
        comprarModal.style.display = "block";
    });
    cancelar2.addEventListener('click', function() {
        comprarModal.style.display = "none";
    });

    // Agregar cantidad del articulo
const counterValue = document.getElementById('counterValue');
let count = 0;

document.getElementById('increment').addEventListener('click', () => {
    count++;
    counterValue.textContent = count;
});

document.getElementById('decrement').addEventListener('click', () => {
    if (count > 0) { 
        count--;
    }
    counterValue.textContent = count;
});

});


