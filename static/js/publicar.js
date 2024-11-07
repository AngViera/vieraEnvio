document.addEventListener('DOMContentLoaded', function () {
    const imageUpload = document.getElementById('imageUpload');
    const gallery = document.getElementById('gallery');

    //Variables Formulario ->
    const precioInput = document.getElementById('precio');
    const nombreInput = document.getElementById('nombre');
    const tipoInput = document.getElementById('tipo');
    const tagsInput = document.getElementById('tags'); 
    const descInput = document.getElementById('descripcion');   
    const submitButton = document.getElementById('publicar');

    //Ayuda textos largos
    const opendesc = document.getElementById('opendesc');
    const descripcionModal = document.getElementById('descripcionModal');
    const saveDescription = document.getElementById('saveDescription');
    const textDescription = document.getElementById('textdescription');
    const span = document.getElementsByClassName('close')[0]; //cerradores de descripcion

    let col;
    const formData = new FormData();

    imageUpload.addEventListener('change', chargeImg);

    function chargeImg(){
        const files = imageUpload.files;

    
    
     for (let i = 0; i < files.length; i++) {
        formData.append('imagesurl', files[i]);
        formData.append('images',files[i].name);
        console.log('images', files[i].name);
    }
            col = document.createElement('div');
            col.classList.add('col-sm-6'); 
        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('figure-card');
            
            
            col.appendChild(img);
            
          
            gallery.appendChild(col);
                }
          
          reader.readAsDataURL(file);
        }
        );} 
  
  

  
        opendesc.addEventListener('focus', function() {
        descripcionModal.style.display = "block";
        textDescription.style = "width: 150%";
        });

        saveDescription.addEventListener('click', function() {
            opendesc.style.backgroundColor = "#cbcbcb";
            descripcionModal.style.display = "none";
        });
        window.onclick = function(event) {
        if (event.target == descripcionModal) {
            descripcionModal.style.display = "none";
        }
    };
    span.onclick = function() {
        descripcionModal.style.display = "none";

    };


precioInput.addEventListener('input', function() {
    const precioValue = precioInput.value;

    precioInput.classList.remove('input-error');

    if (precioValue < 100 || precioValue.length > 12) {
        precioInput.classList.add('input-error');
    }
});

submitButton.addEventListener('click', function(event) {
    if (precioInput.classList.contains('input-error')) {
        event.preventDefault(); 
    }
});

    
    submitButton.addEventListener('click' , function() {
    event.preventDefault(); 
    // Obtener valores del formulario
    const Nombre = document.getElementById("nombre").value;
    const Precio = document.getElementById("precio").value;
    const ID_Categoria = document.getElementById("tipo").value;
    const Etiquetas = document.getElementById("tags").value;
    const Descripcion = document.getElementById("descripcion").value; 
    const Image = document.getElementById("imageUpload").files[0].name ;
    
    formData.append('Nombre', Nombre);
    formData.append('Precio', Precio);
    formData.append('ID_Categoria', ID_Categoria);
    formData.append('Etiquetas', Etiquetas);
    formData.append('Descripcion', Descripcion);


    fetch('/insertar', {
    
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
        title: 'Articulo Guardado!',
        text: 'Se ha guardado el articulo en el catalogo',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
    })
    .catch(error => {
        console.error('Error:', error); 
    });
        
});
loadCategories(); // Cargar categorias desde bd
    

    function loadCategories() {
        fetch('/get_categorias')
            .then(response => response.json())
            .then(categorias => {
                const tipoSelect = document.getElementById('tipo');
                tipoSelect.innerHTML = '<option value="0">Seleccione una categoria</option>'; 

                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.ID_Categoria; 
                    option.textContent = categoria.Nombre; 
                    tipoSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar categorías:', error);
            });
    }


})

