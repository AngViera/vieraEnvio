

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lagoshop`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--
CREATE DATABASE 'lagoshop';
USE 'lagoshop';

CREATE TABLE `administrador` (
  `Cedula_o_nit` int(11) NOT NULL,
  `Nombres` varchar(50) DEFAULT NULL,
  `Apellidos` varchar(50) DEFAULT NULL,
  `Correo` varchar(50) DEFAULT NULL,
  `Contraseña` varchar(50) DEFAULT NULL,
  `Telefono` varchar(50) DEFAULT NULL,
  `Nit` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`Cedula_o_nit`, `Nombres`, `Apellidos`, `Correo`, `Contraseña`, `Telefono`, `Nit`) VALUES
(12345, 'Admin2', 'Ejemplo', 'miniadmin@correo.com', 'contra123', '787-589-1732', 9518901);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `ID_Categoria` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`ID_Categoria`, `Nombre`) VALUES
(1, 'Alimentos'),
(2, 'Bebidas'),
(3, 'Tecnologia'),
(4, 'Turismo'),
(5, 'Entretenimiento');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `Codigo` int(11) NOT NULL,
  `Nombres` varchar(50) DEFAULT NULL,
  `Apellidos` varchar(50) DEFAULT NULL,
  `Correo` varchar(50) DEFAULT NULL,
  `Contraseña` varchar(50) DEFAULT NULL,
  `Telefono` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `Id_Pedidos` int(11) NOT NULL,
  `Fecha_y_Hora` datetime DEFAULT NULL,
  `Metodo_de_pago` varchar(50) DEFAULT NULL,
  `Direccion` varchar(50) DEFAULT NULL,
  `Comentarios` varchar(50) DEFAULT NULL,
  `Codigo` int(11) DEFAULT NULL,
  `Nit` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `ID_Producto` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Estado` tinyint(4) DEFAULT NULL,
  `Precio` float DEFAULT NULL,
  `ID_Categoria` int(11) DEFAULT NULL,
  `Etiquetas` varchar(100) DEFAULT NULL,
  `Imagesurl` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`ID_Producto`, `Nombre`, `Descripcion`, `Estado`, `Precio`, `ID_Categoria`, `Etiquetas`, `Imagesurl`) VALUES
(100, 'Ejemplo1', 'Este descripcion', 1, 100000, 1, 'Risana', '2.jpg;4.jpg'),
(102, 'Ejemplo2', 'Solomino', 0, 10000000, 1, 'nada', '1.jpg;4.jpg;SALAMINA.jpg'),
(103, 'Dona glaseada', '', 1, 3000, 1, '', 'donut.jpg'),
(104, 'Soda Limon', '', 1, 8000, 2, '', 'refresco.png;atras.jpg'),
(105, 'Laptop', 'Laptop de última generación', 1, 4500000, 3, NULL, 'laptop.jpg'),
(106, 'Repuesto Motor', 'Repuesto galvanizado material practico tecnico industrial indexado para reconformacion de materiales compuesto generales y reformulacion de caida hidraulica con sintaxis de aceleracion a medida de revoluciones por minuto industrial', 0, 250000, 4, '', 'motor.jpg'),
(107, 'Película de Acción', 'Una emocionante película de acción', 1, 8000, 5, NULL, 'portada.jpg;thriller.jpg'),
(108, 'Pizza', 'Deliciosa pizza de pepperoni', 1, 40000, 1, NULL, 'pizza.jpg;pepperoni.jpg'),
(109, 'Pasta', 'Pasta al dente con salsa', 1, 25000, 1, NULL, 'pasta.jpg;spaghetti.jpg'),
(110, 'Jugo Natural', 'Jugo fresco de frutas', 1, 10000, 2, NULL, 'jugo.jpg'),
(112, 'Ejemplo 3', '', 1, 10000, 2, 'Risana', '4.jpg;atras.jpg;donut.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sub-categorias`
--

CREATE TABLE `sub-categorias` (
  `ID_Sub-Categorias` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  `ID_Categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `superadmin`
--

CREATE TABLE `superadmin` (
  `ID_Superadmin` int(11) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Contraseña` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `superadmin`
--

INSERT INTO `superadmin` (`ID_Superadmin`, `Correo`, `Contraseña`) VALUES
(1, 'superadmin@correoprincipal.com', 'Lagito123@');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiendas`
--

CREATE TABLE `tiendas` (
  `Nit` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  `Direccion` varchar(50) DEFAULT NULL,
  `Estado` tinyint(4) DEFAULT NULL,
  `ID_Categoria` int(11) DEFAULT NULL,
  `Cedula_o_nit` int(11) DEFAULT NULL,
  `Icono` varchar(50) DEFAULT NULL,
  `Banner` varchar(50) DEFAULT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Horario_Lunes_Apertura` time DEFAULT NULL,
  `Horario_Lunes_Cierre` time DEFAULT NULL,
  `Horario_Martes_Apertura` time DEFAULT NULL,
  `Horario_Martes_Cierre` time DEFAULT NULL,
  `Horario_Miercoles_Apertura` time DEFAULT NULL,
  `Horario_Miercoles_Cierre` time DEFAULT NULL,
  `Horario_Jueves_Apertura` time DEFAULT NULL,
  `Horario_Jueves_Cierre` time DEFAULT NULL,
  `Horario_Viernes_Apertura` time DEFAULT NULL,
  `Horario_Viernes_Cierre` time DEFAULT NULL,
  `Horario_Sabado_Apertura` time DEFAULT NULL,
  `Horario_Sabado_Cierre` time DEFAULT NULL,
  `Horario_Domingo_Apertura` time DEFAULT NULL,
  `Horario_Domingo_Cierre` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tiendas`
--

INSERT INTO `tiendas` (`Nit`, `Nombre`, `Direccion`, `Estado`, `ID_Categoria`, `Cedula_o_nit`, `Icono`, `Banner`, `Descripcion`, `Horario_Lunes_Apertura`, `Horario_Lunes_Cierre`, `Horario_Martes_Apertura`, `Horario_Martes_Cierre`, `Horario_Miercoles_Apertura`, `Horario_Miercoles_Cierre`, `Horario_Jueves_Apertura`, `Horario_Jueves_Cierre`, `Horario_Viernes_Apertura`, `Horario_Viernes_Cierre`, `Horario_Sabado_Apertura`, `Horario_Sabado_Cierre`, `Horario_Domingo_Apertura`, `Horario_Domingo_Cierre`) VALUES
(105895298, 'Salamina', NULL, 1, 1, 12345, 'SALAMINA.jpg', '4.jpg', 'Disfruta de una experiencia gastronómica única con platos locales en un ambiente acogedor.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1045626728, 'Sabor de aqui', NULL, 1, 1, 12345, 'SaborDeAqui.jpeg', 'pollobanner.jpg', 'Comida típica, Carne, Asados, Ahumados, Costilla, Frijoles, Sancocho, Bandeja Paisa, Mondongo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1091401329, 'Risana', NULL, 1, 1, 12345, 'Risana.jpg', '2.jpg', 'Ven y disfruta de este delicioso restaurante RISANA, comida rica y sana.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`Cedula_o_nit`),
  ADD KEY `FK_administrador_tiendas` (`Nit`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`ID_Categoria`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`Codigo`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`Id_Pedidos`),
  ADD KEY `FK_pedidos_clientes` (`Codigo`),
  ADD KEY `FK_pedidos_tiendas` (`Nit`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`ID_Producto`);

--
-- Indices de la tabla `superadmin`
--
ALTER TABLE `superadmin`
  ADD PRIMARY KEY (`ID_Superadmin`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- Indices de la tabla `tiendas`
--
ALTER TABLE `tiendas`
  ADD PRIMARY KEY (`Nit`),
  ADD KEY `FK_tiendas_administrador` (`Cedula_o_nit`),
  ADD KEY `FK_tiendas_categorias` (`ID_Categoria`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `ID_Categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `ID_Producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de la tabla `superadmin`
--
ALTER TABLE `superadmin`
  MODIFY `ID_Superadmin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tiendas`
--
ALTER TABLE `tiendas`
  ADD CONSTRAINT `FK_tiendas_administrador` FOREIGN KEY (`Cedula_o_nit`) REFERENCES `administrador` (`Cedula_o_nit`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_tiendas_categorias` FOREIGN KEY (`ID_Categoria`) REFERENCES `categorias` (`ID_Categoria`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;