export const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: 2,
    username: 'demo',
    password: 'demo123',
    name: 'Usuario Demo',
    role: 'user'
  }
];

export function getUserByUsername(username) {
  return users.find((user) => user.username.toLowerCase() === username.trim().toLowerCase());
}

export function validateCredentials(username, password) {
  const user = getUserByUsername(username);

  if (!user) {
    return { success: false, message: 'El usuario no existe.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'La contraseña es incorrecta.' };
  }

  return {
    success: true,
    message: 'Bienvenido',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  };
}
