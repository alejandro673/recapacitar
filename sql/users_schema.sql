CREATE DATABASE IF NOT EXISTS recapacitar_db;
USE recapacitar_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  anio_nacimiento INT NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);

-- Ejemplo de inserción de usuario (solo para prueba)
-- INSERT INTO users (nombre, apellidos, anio_nacimiento, email, password_hash)
-- VALUES ('Admin', 'Sistema', 1990, 'admin@ejemplo.com', '$2a$10$eImiTXuWVxfM37L4QXK2Q.dQXxgA2GqL3hY3Q9m0jvZQx0XQ9Ue8S');

-- Query para validar login por email
-- SELECT id, nombre, apellidos, anio_nacimiento, email, password_hash
-- FROM users
-- WHERE email = 'admin@ejemplo.com';

-- Query para listar usuarios registrados
-- SELECT id, nombre, apellidos, anio_nacimiento, email, created_at
-- FROM users
-- ORDER BY created_at DESC;
