import os
from flask import Flask, render_template, request, send_from_directory, jsonify, redirect, url_for, flash, session, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from sqlalchemy.sql import text
from flask_mail import Mail, Message 
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
import stripe

app = Flask(__name__)

CSS_FOLDER = 'css'
app.config['CSS_FOLDER'] = CSS_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/lagoshop'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'img')  # Carga dinámica de imágenes
app.config['SECRET_KEY'] = 'clave1'  # Clave para usar funciones flask_login
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mariana.viera@correounivalle.edu.co'  
app.config['MAIL_PASSWORD'] = 'L12345inda@'  
app.config['MAIL_DEFAULT_SENDER'] = 'mariana.viera@correounivalle.edu.co'

mail = Mail(app)

stripe.api_key = 'sk_test_51PzKbpIIN8kEZxuIcwgMreQWDp318BIE8ZPrGeRpdHykjQYyeCO73a5qytxyW0YGYMGbXA8gxV7ZyNVcFa05UQ0z00GhanqXmf'
from models import db, Superadmin, Administrador, Cliente, Productos, Pedidos, Categorias, SubCategorias, Tiendas, Solicitudes # Importar modelos de db

db.init_app(app)  # Inicializar conexión


login_manager = LoginManager(app)
login_manager.login_view = 'login'  # Funciones de login preinstaladas

# Ruta de Stripe para manejo de pagos
@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        # Lee los datos del cuerpo de la solicitud
        data = request.get_json()
        amount = data.get('amount')  # La cantidad en centavos
        currency = data.get('currency')  # Moneda, por ejemplo, 'cop' o 'usd'

        # Validación de parámetros
        if amount is None or currency is None or amount <= 0:
            return jsonify(error="Faltan parámetros o la cantidad es inválida."), 400  # Manejo de error para parámetros faltantes

        # Asegúrate de que el monto es válido para la moneda seleccionada
        if currency == 'cop' and amount < 5000:  # Monto mínimo de 50 centavos en COP
            return jsonify(error="El monto mínimo es de 5000 COP."), 400  # Ajusta según tu requerimiento

        # Crea un PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
        )

        # Devuelve el client_secret al frontend
        return jsonify({
            'clientSecret': payment_intent['client_secret']
        })
    except stripe.error.StripeError as e:
        # Manejo específico de errores de Stripe
        return jsonify(error=str(e.user_message)), 400  # Mensaje de error de Stripe
    except Exception as e:
        # Manejo de otros errores
        return jsonify(error="Ocurrió un error inesperado: " + str(e)), 500  # Error genérico

#Rutas Principales ->
@app.route('/css/<filename>')
def css(filename):
    return send_from_directory(app.config['CSS_FOLDER'], filename) #carga de archivos css

from flask import request, jsonify
from werkzeug.utils import secure_filename
from models import db, Productos

@app.route('/insertar', methods=['POST'])
def insertar_catalogo():
    imagesurl = []

    if 'imagesurl' in request.files:
        files = request.files.getlist('imagesurl')
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                imagesurl.append(filename)

    image_urls_str = ';'.join(imagesurl)

    # Recuperar datos del formulario en publicar.js
    nombre = request.form.get('Nombre')
    descripcion = request.form.get('Descripcion')
    precio = request.form.get('Precio')
    id_categoria = request.form.get('ID_Categoria')
    etiquetas = request.form.get('Etiquetas')

    try:

        nuevo_producto = Productos(
            Nombre=nombre,
            Descripcion=descripcion,
            Estado=1,  # Activo por defecto
            Precio=precio,
            ID_Categoria=id_categoria,
            Etiquetas=etiquetas,
            Imagesurl=image_urls_str
        )

        db.session.add(nuevo_producto)
        db.session.commit()

        # Devolver respuesta de éxito
        return jsonify({"message": "Producto insertado correctamente"}), 201

    except Exception as e:
       
        db.session.rollback()

        print(f"Error al insertar producto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/productos', methods=['GET'])
def listar_productos():
    productos = Productos.query.all()
    
    productos = [{
        'id': producto.ID_Producto,
        'nombre': producto.Nombre,
        'descripcion': producto.Descripcion,
        'precio': producto.Precio,
        'estado': producto.Estado,
        'imagesurl': producto.Imagesurl.split(';') if producto.Imagesurl else []
    } for producto in productos]
    
    return jsonify({'productos': productos})
# Para mostrar descripcion como parrafo y no como linea
def format_description(descripcion, palabras_por_linea=5):
    palabras = descripcion.split()
    lineas = [' '.join(palabras[i:i + palabras_por_linea]) for i in range(0, len(palabras), palabras_por_linea)]

    return '<br>'.join(lineas)

@app.route('/producto/<int:idproducto>')    #Pagina dinamica de producto
def producto(idproducto):
    # Consultar el producto por ID usando el modelo de SQLAlchemy
    producto = Productos.query.filter_by(ID_Producto=idproducto).first()

    if producto is None:
        return "Producto no encontrado", 404

    # Obtener la cadena de URLs de imagenes y convertirlo en un array
    imagesurl_str = producto.Imagesurl
    imagesurl = imagesurl_str.split(';') if imagesurl_str else []

    productoid = producto.ID_Producto
    nombre = producto.Nombre
    precio = producto.Precio
    descripcioncruda = producto.Descripcion
    descripcion = format_description(descripcioncruda)
    estado = producto.Estado
    etiquetas = producto.Etiquetas

    return render_template('producto.html', 
                           imagesurl=imagesurl,
                           productoid=productoid,
                           nombre=nombre,
                           precio=precio,
                           etiquetas=etiquetas,
                           estado=estado,
                           descripcion=descripcion)

@app.route('/delete_producto/<int:idproducto>', methods=['DELETE'])
def delete_producto(idproducto):
    producto = Productos.query.get(idproducto)
    if producto is None:
        return {"message": "Producto no encontrado"}, 404
    
    db.session.delete(producto)
    db.session.commit()
    return {"message": "Producto descontinuado"}, 200

@app.route('/editar_producto/<int:producto_id>', methods=['PUT'])
def editar_producto(producto_id):
    data = request.get_json()
    
    producto = Productos.query.get(producto_id)
    
    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404

    # Actualizar los campos del producto
    producto.Nombre = data['nombre']
    producto.Precio = data['precio']
    producto.Descripcion = data['descripcion']
    producto.Etiquetas = data['etiquetas']
    producto.Imagesurl = ';'.join(data['imagesurl'])  # lista de nombres de archivo

    db.session.commit()
    
    return jsonify({'message': 'Producto actualizado exitosamente'}), 200

@app.route('/resumen_ventas')
@login_required
def resumen_ventas():
    if not isinstance(current_user, Administrador):
        return redirect(url_for('dashboard'))
    
    ventas = db.session.query(db.func.sum(Pedidos.Total)).filter(Pedidos.Nit == current_user.Nit).scalar() or 0
    
    num_pedidos = db.session.query(db.func.count(Pedidos.Id_Pedidos)).filter(Pedidos.Nit == current_user.Nit).scalar() or 0

    productos = db.session.query(
        Productos.Nombre,
        db.func.count(Pedidos.Id_Pedidos).label('cantidad_vendida')
    ).join(Pedidos, Pedidos.ProductoId == Productos.Id).filter(Pedidos.Nit == current_user.Nit).group_by(Productos.Nombre).all()
    
    return render_template('resumen_ventas.html', total_ventas=ventas, num_pedidos=num_pedidos, productos=productos)

@app.route('/cambiar_estado/<int:id_producto>', methods=['PUT'])
def cambiar_estado(id_producto):
    producto = Productos.query.get(id_producto)
    
    if producto is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    if producto.Estado == 1:
        producto.Estado = 0
    else:
        return jsonify({"error": "El producto ya habia sido marcado"}), 400

    db.session.commit()
    return jsonify({"mensaje": "Producto marcado como agotado", "nuevo_estado": producto.Estado}), 200

@app.route('/activar_producto/<int:product_id>', methods=['PUT'])
def activar_producto(product_id):
    producto = Productos.query.get(product_id)

    if not producto:
        return jsonify({'message': 'Producto no encontrado'}), 404

    producto.Estado = 1
    
    try:
        db.session.commit()
        return jsonify({'message': 'Producto activado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al activar el producto', 'error': str(e)}), 500

@app.route('/buscar')
def buscar():
    query = request.args.get('q', '')  
    categorias = request.args.getlist('categoria')  # Obtener todas las categorías seleccionadas
    precio_maximo = request.args.get('precioMaximo', type=float)  
    
    results = Productos.query
    
    if query:
        try:
            query_id = int(query)
            results = results.filter(Productos.ID_Producto == query_id)
        except ValueError:
            results = results.filter(Productos.Nombre.ilike(f'%{query}%'))

    # Filtro por categorías si se proporcionan
    if categorias:
        results = results.filter(Productos.ID_Categoria.in_(categorias))

    # Filtro por precio máximo si se proporciona
    if precio_maximo:
        results = results.filter(Productos.Precio <= precio_maximo)

    results = results.filter(Productos.Estado == 1)

    productos = [{
        'id': p.ID_Producto,
        'nombre': p.Nombre,
        'precio': p.Precio,
        'estado': p.Estado,
        'imagesurl': p.Imagesurl.split(';') if p.Imagesurl else []
    } for p in results]

    # Si es una solicitud AJAX, devolver los productos en formato JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'productos': productos})

    return render_template('buscar.html', productos=productos, selected_categories=categorias)

#Insertar nueva tienda
def send_email_to_superadmin(email):
    # Configuración del correo (asegúrate de tener configurado Flask-Mail)
    msg = Message('Nueva Solicitud de Administrador',
                  sender='tu_email@dominio.com',
                  recipients=['marianavieraserna@gmail.com'])
    msg.body = f'Hay una nueva solicitud de administrador de: {email}'
    mail.send(msg)
    
@app.route('/crear_solicitud_admin', methods=['POST'])
def crear_solicitud_admin():
    # Recoger los datos del formulario
    nombre = request.form.get('Nombre')
    direccion = request.form.get('Direccion')
    id_categoria = request.form.get('ID_Categoria')
    descripcion = request.form.get('Descripcion')
    email = request.form.get('Email') 

    # Crear una nueva solicitud en la base de datos
    nueva_solicitud = Solicitudes(
        Nombre=nombre,
        Direccion=direccion,
        ID_Categoria=id_categoria,
        Descripcion=descripcion,
        Email=email,
        Estado='Pendiente'  # Estado inicial de la solicitud
    )

    db.session.add(nueva_solicitud)
    db.session.commit()

    # Enviar un correo al superadmin
    send_email_to_superadmin(email)

    # Mensaje para el usuario
    flash('Su solicitud ha sido creada. Por favor, espere un correo con la respuesta.', 'info')
    return redirect(url_for('login'))

#Ruta para obtener categorias desde bd dinamicamente    
@app.route('/get_categorias', methods=['GET'])
def obtener_categorias():
    categorias = Categorias.query.all()
    categorias_list = [{'ID_Categoria': cat.ID_Categoria, 'Nombre': cat.Nombre} for cat in categorias] 
    return jsonify(categorias_list)

@app.route('/productos_menu', methods=['GET'])
def productos_menu():
    etiquetas = request.args.get('Etiquetas', '')
    
    try:
        # Buscar productos que coincidan con la etiqueta/nombre de la tienda
        productos = Productos.query.filter(Productos.Etiquetas.ilike(f'%{etiquetas}%')).all()

        productos_dict = []
        for producto in productos:
            productos_dict.append({
                'id': producto.ID_Producto,
                'nombre': producto.Nombre,
                'precio': producto.Precio,
                'descripcion': format_description(producto.Descripcion),
                'estado': producto.Estado,
                'imagesurl': producto.Imagesurl.split(';') if producto.Imagesurl else [] 
            })

        return jsonify({'productos': productos_dict})
    except Exception as e:
        print(f"Error al obtener productos relacionados: {e}")
        return jsonify({'error': 'Error al obtener productos'}), 500

 
@app.route('/buscar_similares/<int:producto_id>', methods=['GET'])
def buscar_similares(producto_id):
    producto_base = Productos.query.get(producto_id)
    
    if not producto_base:
        return jsonify({'productos_similares': []}), 404
    
    # Inicializar la lista de productos similares
    similares = []

    # Buscar productos similares por etiquetas
    if producto_base.Etiquetas:
        etiquetas = [etiqueta.strip() for etiqueta in producto_base.Etiquetas.split(',')]
        for etiqueta in etiquetas:
            productos_por_etiqueta = Productos.query.filter(
                Productos.Etiquetas.ilike(f'%{etiqueta}%'),
                Productos.ID_Producto != producto_id
            ).all()
            similares.extend(productos_por_etiqueta)
            if len(similares) >= 5:
                break

    if len(similares) < 5:
        # Buscar productos de la misma categoría
        productos_categoria = Productos.query.filter(
            Productos.ID_Categoria == producto_base.ID_Categoria,
            Productos.ID_Producto != producto_id
        ).all()
        
        for producto in productos_categoria:
            if producto not in similares:
                similares.append(producto)
            if len(similares) >= 5:
                break

    # Limitar a 5 productos
    similares = similares[:5]

    productos_similares = [{
        'id': producto.ID_Producto,
        'nombre': producto.Nombre,
        'descripcion': producto.Descripcion,
        'precio': producto.Precio,
        'imagesurl': producto.Imagesurl.split(';') if producto.Imagesurl else []
    } for producto in similares]
    
    return jsonify({'productos_similares': productos_similares})

# Rutas de Sesion y Usuarios
# Definición de clases de usuario dentro de la aplicación
class User(UserMixin): 
    def __init__(self, id, nombres, role):
        self.id = id  # La llave primaria de los usuarios
        self.nombres = nombres # Recuperar nombre de admin actual
        self.role = role  # local o admin / cliente o comprador

# Cargar el usuario desde la base de datos

@login_manager.user_loader
def load_user(user_id):

    user = Administrador.query.get(int(user_id))  

    if not user:

        user = Cliente.query.get(int(user_id))

    if not user:

        user = Superadmin.query.get(int(user_id))  # Aqui está el superadmin

    return user

# Ruta para login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        print(request.form)  # Esto imprimirá el contenido del formulario en la consola del servidor.

        email = request.form.get('email')  # Asegúrate de que el nombre coincida con el input.
        password = request.form.get('contraseña')  # Cambié 'password' a 'contraseña'.
        # Intentar autenticar como Administrador
        admin_user = Administrador.query.filter_by(Correo=email).first()
        # Si no se encuentra como Administrador, intentar como Cliente
        client_user = Cliente.query.filter_by(Correo=email).first()
        # Verificar si se encontró un Administrador
        if admin_user and admin_user.Contraseña == password:
            login_user(admin_user)  # Realiza el inicio de sesión
            return redirect(url_for('home'))  # Redirige al dashboard de Admin
        
        # Verificar si se encontró un Cliente
        if client_user and client_user.Contraseña == password:
            login_user(client_user)  # Realiza el inicio de sesión
            return redirect(url_for('home'))  # Redirige al dashboard de Cliente
           # Autenticación como Superadmin

        superadmin_user = Superadmin.query.filter_by(Correo=email).first()

        if superadmin_user and superadmin_user.Contraseña == password:

            login_user(superadmin_user)
            return redirect(url_for('superadmin_pagina')) 
        # Si no se encontró usuario o la contraseña es incorrecta
        flash('Correo o contraseña incorrectos', 'error')
        return redirect(url_for('login')) 
    return render_template('login.html')

# Ruta para el dashboard (redirige según el rol)

@app.route('/dashboard')

@login_required
def dashboard():

    if isinstance(current_user, Administrador):

        return redirect(url_for('Administrador_pagina'))

    elif isinstance(current_user, Cliente):

        return redirect(url_for('Cliente_pagina'))

# Ruta superadmin
@app.route('/ver_solicitudes')
@login_required
def ver_solicitudes():
    if not isinstance(current_user, Superadmin):
        return redirect(url_for('index'))

    solicitudes = Solicitudes.query.filter_by(Estado='Pendiente').all()
    return render_template('ver_solicitudes.html', solicitudes=solicitudes)

@app.route('/manejar_solicitud/<int:id>', methods=['POST'])
@login_required
def manejar_solicitud(id):
    solicitud = Solicitudes.query.get(id)
    accion = request.form.get('accion')  # 'aceptar' o 'rechazar'
    razon = request.form.get('razon')  # Razón en caso de rechazo

    if solicitud is None:
        return redirect(url_for('ver_solicitudes'))  # Manejo de error si no se encuentra la solicitud

    if accion == 'aceptar':
        # Crear el usuario como administrador
        nuevo_admin = Administrador(
            Nombre=solicitud.Nombre,
            Direccion=solicitud.Direccion,  # Asegúrate de incluir todos los campos necesarios
            ID_Categoria=solicitud.ID_Categoria,
            Email=solicitud.Email,
            # Otros campos necesarios
        )
        db.session.add(nuevo_admin)
        solicitud.Estado = 'Aprobada'
        
        # Enviar correo de aprobación
        msg = Message('Solicitud Aprobada',
                      recipients=[solicitud.Email])  # Cambia esto si el email es otro
        msg.body = f"Estimado {solicitud.Nombre},\n\nTu solicitud ha sido aprobada. Bienvenido como administrador."
        mail.send(msg)

    elif accion == 'rechazar':
        solicitud.Estado = 'Rechazada'
    
        try:
                mail.send(msg)
        except Exception as e:
                print(f"Error al enviar correo de rechazo: {e}")
            
        # Enviar correo de rechazo
        msg = Message('Solicitud Rechazada',
                      recipients=[solicitud.Email])  # Cambia esto si el email es otro
        msg.body = f"Estimado {solicitud.Nombre},\n\nTu solicitud ha sido rechazada. Razón: {razon}."
        mail.send(msg)

    db.session.commit()
    return redirect(url_for('ver_solicitudes'))


@app.route('/categorias/agregar', methods=['POST'])
def agregar_categoria():

    nombre = request.form.get('nombre_categoria')

    nueva_categoria = Categorias(Nombre=nombre)

    db.session.add(nueva_categoria)

    db.session.commit()

    flash('Categoría agregada exitosamente', 'success')

    return redirect(url_for('superadmin_dashboard'))

@app.route('/eliminar_categoria', methods=['POST'])
def eliminar_categoria_post():

    data = request.get_json()

    id_categoria = data.get('id')

    categoria = Categorias.query.get_or_404(id_categoria)

    db.session.delete(categoria)

    db.session.commit()

    return jsonify({'message': 'Categoría eliminada correctamente'})

@app.route('/editar_categoria', methods=['POST'])
def editar_categoria():

    data = request.get_json()

    id_categoria = data.get('id')

    nuevo_nombre = data.get('nuevoNombre')

    categoria = Categorias.query.get_or_404(id_categoria)

    categoria.Nombre = nuevo_nombre

    db.session.commit()

    return jsonify({'message': 'Categoría actualizada correctamente'})

#Ruta para la pagina del subadministador
@app.route('/superadmin/dashboard')
@login_required
def superadmin_dashboard():

    if not isinstance(current_user, Superadmin):

        return redirect(url_for('dashboard'))
    # Obtener todas las categorías para mostrarlas en la plantilla

    categorias = Categorias.query.all()

    return render_template('Superadmin_pagina.html', categorias=categorias)

@app.route('/modificar_horario/<nit>')
@login_required
def modificar_horario_page(nit):

    

    tienda = Tiendas.query.filter_by(Nit=nit).first() #aqui es tienda por nit

    

    if not tienda:

        flash('No se encontró la tienda', 'error')

        return redirect(url_for('local_pagina'))  #

    

    # Cargar la página con la información de la tienda

    return render_template('modificar_horario.html', tienda=tienda)



@app.route('/guardar_horario/<nit>', methods=['POST'])
@login_required
def guardar_horario(nit):

    if not isinstance(current_user, Administrador) or current_user.Nit != nit:

        flash('No tienes permisos para modificar este horario.', 'error')

        return redirect(url_for('local_pagina'))

    horarios_dia = {

        'lunes': {

            'apertura': request.form.get('horario_lunes_apertura'),

            'cierre': request.form.get('horario_lunes_cierre')

        },

        'martes': {

            'apertura': request.form.get('horario_martes_apertura'),

            'cierre': request.form.get('horario_martes_cierre')

        },

        'miercoles': {

            'apertura': request.form.get('horario_miercoles_apertura'),

            'cierre': request.form.get('horario_miercoles_cierre')

        },

        'jueves': {

            'apertura': request.form.get('horario_jueves_apertura'),

            'cierre': request.form.get('horario_jueves_cierre')

        },

        'viernes': {

            'apertura': request.form.get('horario_viernes_apertura'),

            'cierre': request.form.get('horario_viernes_cierre')

        },

        'sabado': {

            'apertura': request.form.get('horario_sabado_apertura'),

            'cierre': request.form.get('horario_sabado_cierre')

        },

        'domingo': {

            'apertura': request.form.get('horario_domingo_apertura'),

            'cierre': request.form.get('horario_domingo_cierre')

        }

    }
    # Obtener la tienda por Nit
    tienda = Tiendas.query.filter_by(Nit=nit).first()



    if not tienda:

        flash('No se encontró la tienda', 'error')
        return redirect(url_for('local_pagina'))
    # Actualizar los horarios en la tienda
    tienda.Horario_Lunes_Apertura = horarios_dia['lunes']['apertura']

    tienda.Horario_Lunes_Cierre = horarios_dia['lunes']['cierre']

    tienda.Horario_Martes_Apertura = horarios_dia['martes']['apertura']

    tienda.Horario_Martes_Cierre = horarios_dia['martes']['cierre']

    tienda.Horario_Miercoles_Apertura = horarios_dia['miercoles']['apertura']

    tienda.Horario_Miercoles_Cierre = horarios_dia['miercoles']['cierre']

    tienda.Horario_Jueves_Apertura = horarios_dia['jueves']['apertura']

    tienda.Horario_Jueves_Cierre = horarios_dia['jueves']['cierre']

    tienda.Horario_Viernes_Apertura = horarios_dia['viernes']['apertura']

    tienda.Horario_Viernes_Cierre = horarios_dia['viernes']['cierre']

    tienda.Horario_Sabado_Apertura = horarios_dia['sabado']['apertura']

    tienda.Horario_Sabado_Cierre = horarios_dia['sabado']['cierre']

    tienda.Horario_Domingo_Apertura = horarios_dia['domingo']['apertura']

    tienda.Horario_Domingo_Cierre = horarios_dia['domingo']['cierre']

    db.session.commit()
    flash('Horarios actualizados correctamente.', 'bienn')

    return redirect(url_for('local_pagina'))


# Ruta Cerrar Sesion
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

# Ruta para la página del administrador
@app.route('/local')
@login_required
def local_dashboard():
    if not isinstance(current_user, Administrador):
        return redirect(url_for('dashboard'))
    return render_template('local_pagina.html')

# Ruta para la página del comprador
@app.route('/comprador', methods=['GET', 'POST'])
@login_required
def comprador_dashboard():
    if not isinstance(current_user, Cliente):
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        termino = request.form.get('termino')
        criterio = request.form.get('criterio')

        # Guardar los datos de búsqueda en la sesión
        session['termino'] = termino
        session['criterio'] = criterio

        return redirect(url_for('resultados_busqueda'))

    return render_template('comprador_pagina.html')    

@app.route('/nueva_tienda')
def nueva_tienda():
    
    if not current_user.is_authenticated:
        render_template('index.html')

    return render_template('tienda_menu.html', admin=current_user)


@app.route('/Menu_restaurantes')
def menu_restaurantes():
    tiendas = Tiendas.query.all()

    restaurantes_data = [
        {
            'nombre': tienda.Nombre,
            'icono': tienda.Icono,
            'descripcion': tienda.Descripcion,
            'estado': tienda.Estado
        }
        for tienda in tiendas
    ]

    return render_template('Menu_restaurantes.html', restaurantes=restaurantes_data)


@app.route('/Menu_bebidas') 
def Menu_bebidas():
    return render_template('Menu_bebidas.html') 

@app.route('/Menu_farmacias') 
def Menu_farmacias():
    return render_template('Menu_farmacias.html') 

@app.route('/Menu_supermercados')
def Menu_supermercados():
    return render_template('Menu_supermercados.html')

@app.route('/Menu_helados')
def Menu_helados():
    return render_template ('Menu_helados.html')

@app.route('/Menu_distribuidoras')
def Menu_distribuidoras():
    return render_template ('Menu_distribuidoras.html')

@app.route('/menu/<Nombre>')
def tienda_menu(Nombre):
    tienda = Tiendas.query.filter_by(Nombre=Nombre).first()

    if tienda is None:
        abort(404)

    categoria = Categorias.query.filter_by(ID_Categoria=tienda.ID_Categoria).first()  # Obtener nombre de categoría en vez de su ID

    tienda_data = {
        'nit': tienda.Nit,
        'nombre': tienda.Nombre,
        'direccion': tienda.Direccion,
        'estado': tienda.Estado,
        'id_categoria': tienda.ID_Categoria,
        'cedula_o_nit': tienda.Cedula_o_nit,
        'banner': tienda.Banner,
        'descripcion': tienda.Descripcion,
        #Si no lo hay (es None o null), se mostrara"Cerrado". Lo mismo se aplica a la columna de cierre
        'horario_lunes_apertura': tienda.horario_lunes_apertura,
        'horario_lunes_cierre': tienda.horario_lunes_cierre,
        'horario_martes_apertura': tienda.horario_martes_apertura,
        'horario_martes_cierre': tienda.horario_martes_cierre,
        'horario_miercoles_apertura': tienda.horario_miercoles_apertura,
        'horario_miercoles_cierre': tienda.horario_miercoles_cierre,
        'horario_jueves_apertura': tienda.horario_jueves_apertura,
        'horario_jueves_cierre': tienda.horario_jueves_cierre,
        'horario_viernes_apertura': tienda.horario_viernes_apertura,
        'horario_viernes_cierre': tienda.horario_viernes_cierre,
        'horario_sabado_apertura': tienda.horario_sabado_apertura,
        'horario_sabado_cierre': tienda.horario_sabado_cierre,
        'horario_domingo_apertura': tienda.horario_domingo_apertura,
        'horario_domingo_cierre': tienda.horario_domingo_cierre
    }

    return render_template('tienda_menu.html', tienda=tienda_data, categoria=categoria)#Categoria se declara en otra variable porque se recupera de otra tabla relacionada



@app.route('/publicar')
def publicar():
    return render_template('publicar.html')

@app.route('/editar') 
def editar():
    return render_template('editor.html') 

# Ruta para registro
@app.route('/registrar', methods=['GET', 'POST'])
def registrar():
    return render_template('registro.html')

@app.route('/pagos') 
def pagos():
    return render_template('pasarela_pagos.html') 

@app.route('/buscar_categoria/<int:categoria>')
def buscar_categoria(categoria):
    # Usando esta ruta para saltar directamente a una categoria de prodcutos
    return redirect(url_for('buscar', categoria=categoria))


@app.route('/') 
def home():
    return render_template('index.html') #<--Define la plantilla a abrir por defecto en la ruta /




if __name__ == '__main__':
    app.run(port=5000,host="0.0.0.0",debug=True) #despliegue , puede cambiar el puerto en port =, debug=true evita la carga del html si hay errores y los muestra
