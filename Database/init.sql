CREATE DATABASE IF NOT EXISTS myeventz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myeventz_db;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS Usuarios (
    Id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    NombreCompleto VARCHAR(255) NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FechaNacimiento DATE,
    Biografia TEXT,
    Instagram VARCHAR(255),
    X VARCHAR(255),
    YouTube VARCHAR(255),
    TikTok VARCHAR(255),
    FotoPerfil VARCHAR(1024),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Categorias (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Eventos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(255) NOT NULL,
    FechaRealizacion DATETIME NOT NULL,
    Descripcion TEXT,
    RangoEdadMin INT,
    RangoEdadMax INT,
    Ubicacion VARCHAR(255) NOT NULL,
    NumMaxParticipantes INT,
    OrganizadorId VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizadorId) REFERENCES Usuarios(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Usuarios_Hobbies (
    UsuarioId VARCHAR(255) NOT NULL,
    CategoriaId INT NOT NULL,
    PRIMARY KEY (UsuarioId, CategoriaId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Eventos_Categorias (
    EventoId INT NOT NULL,
    CategoriaId INT NOT NULL,
    PRIMARY KEY (EventoId, CategoriaId),
    FOREIGN KEY (EventoId) REFERENCES Eventos(Id) ON DELETE CASCADE,
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Participantes_Eventos (
    UsuarioId VARCHAR(255) NOT NULL,
    EventoId INT NOT NULL,
    FechaInscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UsuarioId, EventoId),
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    FOREIGN KEY (EventoId) REFERENCES Eventos(Id) ON DELETE CASCADE
);

-- ===================================================================
-- CATEGORÍAS
-- ===================================================================
INSERT IGNORE INTO Categorias (Nombre) VALUES
('Audiovisual'),     -- 1
('Baloncesto'),      -- 2
('Calistenia'),      -- 3
('Ciclismo'),        -- 4
('Cocina'),          -- 5
('Crossfit'),        -- 6
('Danza'),           -- 7
('Escalada'),        -- 8
('Esgrima'),         -- 9
('Futbol'),          -- 10
('IA'),              -- 11
('Gimnasia'),        -- 12
('Golf'),            -- 13
('Karate'),          -- 14
('Motocross'),       -- 15
('Deportes'),        -- 16
('Música'),          -- 17
('Arte'),            -- 18
('Tecnología'),      -- 19
('Cine'),            -- 20
('Gastronomía'),     -- 21
('Aire Libre'),      -- 22
('Videojuegos'),     -- 23
('Skate'),           -- 24
('Parkour'),         -- 25
('Mountain Bike'),   -- 26
('Volleyball'),      -- 27
('Senderismo'),      -- 28
('Fotografía'),      -- 29
('Programación'),    -- 30
('Running'),         -- 31
('Yoga'),            -- 32
('Natación'),        -- 33
('Paddle'),          -- 34
('Tenis');           -- 35

-- ===================================================================
-- USUARIOS (7 usuarios dummy)
-- ===================================================================
INSERT IGNORE INTO Usuarios (Id, NombreCompleto, Username, Email, FechaNacimiento, Biografia, Instagram, X, TikTok, YouTube) VALUES

('demo-user-001', 'Gabriel Milagro López', 'gamilikko', 'gabriel@example.com', '2001-03-15',
 'Me gusta la edición de video, salir con los amigos y el deporte en general, sobre todo el skate. Futuro programador de éxito.',
 'gamilikko', 'gamilikko', 'gamilikko', NULL),

('demo-user-002', 'Carlos Fernández Guevara', 'charlysaurio', 'carlos@example.com', '2000-07-22',
 'Apasionado del ciclismo de montaña y la tecnología. Siempre buscando nuevas rutas por el Pirineo aragonés.',
 'charlysaurio', NULL, NULL, 'charlysaurio_mtb'),

('demo-user-003', 'Jorge Alquezar', 'jorgealquezar', 'jorge@example.com', '1999-11-10',
 'Desarrollador web y amante de los deportes al aire libre. Organizador de eventos deportivos en Zaragoza.',
 'jorgealquezar', 'jorgealquezar', NULL, NULL),

('demo-user-004', 'María García Sánchez', 'mariagarcia', 'maria@example.com', '2002-05-18',
 'Estudiante de Bellas Artes. Me encanta la fotografía, la pintura y organizar talleres creativos para la comunidad.',
 'maria_art', 'mariagart', 'maria.art', NULL),

('demo-user-005', 'Alejandro Ruiz Pérez', 'alexruiz', 'alex@example.com', '1998-09-03',
 'Entrenador personal y amante del crossfit. Organizo quedadas de entrenamiento funcional en parques de Zaragoza.',
 'alexruiz_fit', 'alexruiz', 'alexruiz_fit', 'alexruiz_fitness'),

('demo-user-006', 'Laura Martínez Domingo', 'lauramartinez', 'laura@example.com', '2001-12-25',
 'Cocinera vocacional y senderista. Me gusta conocer gente nueva y compartir experiencias gastronómicas.',
 'lauracooks', NULL, 'lauracooks', NULL),

('demo-user-007', 'Pablo Navarro Gil', 'pablonavarro', 'pablo@example.com', '2000-02-14',
 'Músico y productor amateur. Toco la guitarra y organizo jam sessions. También me mola el parkour y el skate.',
 'pablomusic', 'pablon', 'pablomusic', 'pablonavarro_music');

-- ===================================================================
-- HOBBIES DE USUARIOS
-- ===================================================================
INSERT IGNORE INTO Usuarios_Hobbies (UsuarioId, CategoriaId) VALUES
-- Gabriel: Audiovisual, Skate, Parkour, Videojuegos, Programación
('demo-user-001', 1), ('demo-user-001', 24), ('demo-user-001', 25), ('demo-user-001', 23), ('demo-user-001', 30),
-- Carlos: Ciclismo, Mountain Bike, Tecnología, Senderismo
('demo-user-002', 4), ('demo-user-002', 26), ('demo-user-002', 19), ('demo-user-002', 28),
-- Jorge: Deportes, Aire Libre, Tecnología, Running, Programación
('demo-user-003', 16), ('demo-user-003', 22), ('demo-user-003', 19), ('demo-user-003', 31), ('demo-user-003', 30),
-- María: Arte, Fotografía, Cine, Danza
('demo-user-004', 18), ('demo-user-004', 29), ('demo-user-004', 20), ('demo-user-004', 7),
-- Alex: Crossfit, Calistenia, Running, Deportes, Gimnasia
('demo-user-005', 6), ('demo-user-005', 3), ('demo-user-005', 31), ('demo-user-005', 16), ('demo-user-005', 12),
-- Laura: Cocina, Gastronomía, Senderismo, Yoga, Aire Libre
('demo-user-006', 5), ('demo-user-006', 21), ('demo-user-006', 28), ('demo-user-006', 32), ('demo-user-006', 22),
-- Pablo: Música, Parkour, Skate, Audiovisual
('demo-user-007', 17), ('demo-user-007', 25), ('demo-user-007', 24), ('demo-user-007', 1);

-- ===================================================================
-- EVENTOS (12 eventos con ubicaciones reales de Zaragoza)
-- ===================================================================
INSERT IGNORE INTO Eventos (Id, Titulo, FechaRealizacion, Descripcion, RangoEdadMin, RangoEdadMax, Ubicacion, NumMaxParticipantes, OrganizadorId) VALUES

(1, 'Torneo de Skate S.K.A.T.E.', '2025-06-15 17:00:00',
 'Torneo amistoso de S.K.A.T.E. abierto a todos los niveles. Ven a disfrutar del mejor skateboarding de Zaragoza. Habrá premios para los 3 primeros clasificados y sorteos entre todos los participantes.',
 16, 35, 'Skate Park Ignacio Echevarría, Zaragoza', 30, 'demo-user-001'),

(2, 'Ruta MTB por los Galachos', '2025-06-22 09:00:00',
 'Ruta de mountain bike de dificultad media por la Reserva Natural de los Galachos del Ebro. Recorrido de aproximadamente 35km con paisajes espectaculares. Imprescindible llevar casco y agua.',
 18, 50, 'Reserva Natural Galachos del Ebro, Pastriz', 20, 'demo-user-002'),

(3, 'Hackathon de IA Zaragoza', '2025-07-05 10:00:00',
 'Hackathon de 24 horas dedicado a proyectos de Inteligencia Artificial. Equipos de 3-5 personas. Se proporcionará comida, bebida y acceso a APIs de OpenAI y Google. Los mejores proyectos recibirán mentoría de profesionales del sector.',
 18, NULL, 'Etopia Centro de Arte y Tecnología, Zaragoza', 60, 'demo-user-003'),

(4, 'Partido de Volleyball playa', '2025-06-08 18:30:00',
 'Partido amistoso de volleyball en las pistas de playa del CDM La Almozara. Buscamos jugadores de todos los niveles para armar equipos mixtos. ¡Trae toalla y ganas de pasarlo bien!',
 16, 40, 'CDM La Almozara, Zaragoza', 16, 'demo-user-003'),

(5, 'Quedada de Parkour urbano', '2025-06-29 11:00:00',
 'Sesión de parkour por el centro de Zaragoza. Empezaremos con calentamiento y técnica básica para principiantes, y luego recorreremos spots por la zona del Casco Histórico. Trae ropa cómoda y zapatillas con buen agarre.',
 16, 30, 'Plaza del Pilar, Zaragoza', 15, 'demo-user-001'),

(6, 'Taller de cocina aragonesa', '2025-07-12 17:00:00',
 'Aprende a cocinar los platos más típicos de Aragón: migas, ternasco, borrajas con patatas... Todos los ingredientes incluidos. Al final nos comeremos lo preparado entre todos.',
 18, NULL, 'Mercado Central, Zaragoza', 12, 'demo-user-006'),

(7, 'Sesión de Crossfit al aire libre', '2025-06-20 08:00:00',
 'Entrenamiento funcional de alta intensidad en el Parque Grande José Antonio Labordeta. Todos los niveles bienvenidos. Traed agua, toalla y muchas ganas. ¡El que llega tarde calienta doble!',
 18, 45, 'Parque Grande José Antonio Labordeta, Zaragoza', 25, 'demo-user-005'),

(8, 'Exposición de Fotografía Urbana', '2025-07-01 19:00:00',
 'Inauguración de la exposición colectiva "Zaragoza a Través del Objetivo". Si eres fotógrafo/a, puedes enviar hasta 3 obras. Si no, ven a disfrutar del arte y el vermut de bienvenida.',
 NULL, NULL, 'Centro de Historias, Zaragoza', 50, 'demo-user-004'),

(9, 'Jam Session: Noche de Blues', '2025-06-28 21:30:00',
 'Jam session abierta para músicos y amantes del blues. Trae tu instrumento o simplemente ven a escuchar. Ambiente relajado, buena música y cervezas artesanas.',
 18, NULL, 'La Casa del Loco, Zaragoza', 40, 'demo-user-007'),

(10, 'Ruta de senderismo: Monasterio de Piedra', '2025-07-08 07:30:00',
 'Excursión al Monasterio de Piedra con ruta por las cascadas y el parque natural. Dificultad baja-media, apta para principiantes. Organizamos transporte compartido desde Zaragoza.',
 16, 60, 'Monasterio de Piedra, Nuévalos', 18, 'demo-user-006'),

(11, 'Torneo de Paddle amateur', '2025-07-15 10:00:00',
 'Torneo de paddle por parejas. Nivel amateur a intermedio. Inscripción por equipos de 2. Las pistas y pelotas están incluidas. Premios para los finalistas.',
 16, 50, 'Club de Paddle Zaragoza, Vía Hispanidad', 24, 'demo-user-005'),

(12, 'Taller de Desarrollo Web con React', '2025-07-20 16:00:00',
 'Taller práctico de introducción a React. Construiremos una app desde cero en 3 horas. Trae tu portátil con Node.js instalado. Nivel: saber HTML, CSS y algo de JavaScript.',
 16, NULL, 'Etopia Centro de Arte y Tecnología, Zaragoza', 30, 'demo-user-003');

-- ===================================================================
-- CATEGORÍAS DE EVENTOS
-- ===================================================================
INSERT IGNORE INTO Eventos_Categorias (EventoId, CategoriaId) VALUES
-- Torneo Skate -> Skate, Deportes
(1, 24), (1, 16),
-- Ruta MTB -> Ciclismo, Mountain Bike, Aire Libre
(2, 4), (2, 26), (2, 22),
-- Hackathon -> IA, Tecnología, Programación
(3, 11), (3, 19), (3, 30),
-- Volleyball -> Volleyball, Deportes
(4, 27), (4, 16),
-- Parkour -> Parkour, Deportes
(5, 25), (5, 16),
-- Taller cocina -> Cocina, Gastronomía
(6, 5), (6, 21),
-- Crossfit -> Crossfit, Deportes, Calistenia
(7, 6), (7, 16), (7, 3),
-- Expo Fotografía -> Fotografía, Arte
(8, 29), (8, 18),
-- Jam Session -> Música
(9, 17),
-- Senderismo -> Senderismo, Aire Libre
(10, 28), (10, 22),
-- Paddle -> Paddle, Deportes
(11, 34), (11, 16),
-- Taller React -> Tecnología, Programación
(12, 19), (12, 30);

-- ===================================================================
-- PARTICIPACIONES
-- ===================================================================
INSERT IGNORE INTO Participantes_Eventos (UsuarioId, EventoId) VALUES
-- Torneo Skate: Gabriel (org), Carlos, Jorge, Pablo
('demo-user-002', 1), ('demo-user-003', 1), ('demo-user-007', 1),
-- Ruta MTB: Carlos (org), Jorge, Alex
('demo-user-003', 2), ('demo-user-005', 2),
-- Hackathon: Jorge (org), Gabriel, Carlos, María
('demo-user-001', 3), ('demo-user-002', 3), ('demo-user-004', 3),
-- Volleyball: Jorge (org), Gabriel, Alex, Laura
('demo-user-001', 4), ('demo-user-005', 4), ('demo-user-006', 4),
-- Parkour: Gabriel (org), Pablo, Carlos
('demo-user-007', 5), ('demo-user-002', 5),
-- Taller cocina: Laura (org), María, Alex, Pablo
('demo-user-004', 6), ('demo-user-005', 6), ('demo-user-007', 6),
-- Crossfit: Alex (org), Jorge, Gabriel, Carlos
('demo-user-003', 7), ('demo-user-001', 7), ('demo-user-002', 7),
-- Expo Foto: María (org), Laura, Pablo
('demo-user-006', 8), ('demo-user-007', 8),
-- Jam Session: Pablo (org), María, Gabriel
('demo-user-004', 9), ('demo-user-001', 9),
-- Senderismo: Laura (org), Carlos, María, Jorge, Alex
('demo-user-002', 10), ('demo-user-004', 10), ('demo-user-003', 10), ('demo-user-005', 10),
-- Paddle: Alex (org), Jorge, Gabriel, Pablo
('demo-user-003', 11), ('demo-user-001', 11), ('demo-user-007', 11),
-- Taller React: Jorge (org), Gabriel, Carlos, María
('demo-user-001', 12), ('demo-user-002', 12), ('demo-user-004', 12);
