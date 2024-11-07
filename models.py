from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

# Modelos
class Superadmin(db.Model):
    __tablename__ = 'superadmin'
    ID_Superadmin = db.Column(db.Integer, primary_key=True)
    Correo = db.Column(db.String(100), unique=True, nullable=False)
    Password = db.Column(db.String(100), nullable=False)


class Solicitudes(db.Model):
    __tablename__ = 'solicitudes'
    id = db.Column(db.Integer, primary_key=True)
    Nombre = db.Column(db.String(100))
    Direccion = db.Column(db.String(200))
    ID_Categoria = db.Column(db.Integer, db.ForeignKey('categorias.ID_Categoria'))
    Descripcion = db.Column(db.String(500))
    Email = db.Column(db.String(100))
    Estado = db.Column(db.String(20))


class Administrador(UserMixin, db.Model):
    __tablename__ = 'administrador'
    Cedula_o_nit = db.Column(db.Integer, primary_key=True)
    Nombres = db.Column(db.String(50))
    Apellidos = db.Column(db.String(50))
    Correo = db.Column(db.String(50))
    Password = db.Column(db.String(50))
    Telefono = db.Column(db.String(50))
    Nit = db.Column(db.Integer)


class Cliente(UserMixin, db.Model):
    __tablename__ = 'clientes'
    ID_Cliente = db.Column(db.Integer, primary_key=True)
    Nombres = db.Column(db.String(50))
    Apellidos = db.Column(db.String(50))
    Correo = db.Column(db.String(50))
    Password = db.Column(db.String(50))
    Telefono = db.Column(db.String(50))


class Productos(db.Model):
    __tablename__ = 'productos'
    ID_Producto = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(100), nullable=False)
    Descripcion = db.Column(db.Text, nullable=True)
    Estado = db.Column(db.Integer, nullable=False)
    Precio = db.Column(db.Float, nullable=False)
    ID_Categoria = db.Column(db.Integer, db.ForeignKey('categorias.ID_Categoria'), nullable=False)
    Etiquetas = db.Column(db.String(100), nullable=True)
    Imagesurl = db.Column(db.String(255), nullable=True)


class Categorias(db.Model):
    __tablename__ = 'categorias'
    ID_Categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(50))


class Pedidos(db.Model):
    __tablename__ = 'pedidos'
    Id_Pedidos = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Fecha_y_Hora = db.Column(db.DateTime)
    Metodo_de_pago = db.Column(db.String(50))
    Direccion = db.Column(db.String(50))
    Comentarios = db.Column(db.String(50))
    ID_Cliente = db.Column(db.Integer, db.ForeignKey('clientes.ID_Cliente'))
    ID_Tienda = db.Column(db.Integer, db.ForeignKey('tiendas.Nit'))


class SubCategorias(db.Model):
    __tablename__ = 'subcategorias'
    ID_Sub_Categorias = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nombre = db.Column(db.String(50))
    ID_Categoria = db.Column(db.Integer, db.ForeignKey('categorias.ID_Categoria'))


class Tiendas(db.Model):
    __tablename__ = 'tiendas'
    Nit = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    Nombre = db.Column(db.String(100), nullable=False)
    Direccion = db.Column(db.String(200), nullable=True)
    Estado = db.Column(db.Boolean, nullable=False)
    ID_Categoria = db.Column(db.Integer, db.ForeignKey('categorias.ID_Categoria'), nullable=False)
    Cedula_o_nit = db.Column(db.String(50), nullable=False)
    Icono = db.Column(db.String(100), nullable=True)
    Banner = db.Column(db.String(100), nullable=True)
    Descripcion = db.Column(db.Text, nullable=True)
    
    horario_lunes_apertura = db.Column(db.Time, nullable=True)
    horario_lunes_cierre = db.Column(db.Time, nullable=True)
    horario_martes_apertura = db.Column(db.Time, nullable=True)
    horario_martes_cierre = db.Column(db.Time, nullable=True)
    horario_miercoles_apertura = db.Column(db.Time, nullable=True)
    horario_miercoles_cierre = db.Column(db.Time, nullable=True)
    horario_jueves_apertura = db.Column(db.Time, nullable=True)
    horario_jueves_cierre = db.Column(db.Time, nullable=True)
    horario_viernes_apertura = db.Column(db.Time, nullable=True)
    horario_viernes_cierre = db.Column(db.Time, nullable=True)
    horario_sabado_apertura = db.Column(db.Time, nullable=True)
    horario_sabado_cierre = db.Column(db.Time, nullable=True)
    horario_domingo_apertura = db.Column(db.Time, nullable=True)
    horario_domingo_cierre = db.Column(db.Time, nullable=True)
