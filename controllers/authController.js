const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contrasena son obligatorios' });
    }
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'El email ya esta registrado' });
    const user = await User.create({ name, email, phone, password });
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contrasena son obligatorios' });
    }
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciales invalidas' });
    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Credenciales invalidas' });
    const token = signToken(user);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) { next(err); }
};