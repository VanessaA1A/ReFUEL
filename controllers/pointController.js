const CollectionPoint = require('../models/CollectionPoint');

exports.list = async (req, res, next) => {
  try {
    const { city, active } = req.query;
    const activeOnly = active !== 'false';
    const points = await CollectionPoint.findAll({ city, activeOnly });
    res.json(points);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const point = await CollectionPoint.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'Punto no encontrado' });
    res.json(point);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const point = await CollectionPoint.create(req.body);
    res.status(201).json(point);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const point = await CollectionPoint.update(req.params.id, req.body);
    if (!point) return res.status(404).json({ message: 'Punto no encontrado' });
    res.json(point);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await CollectionPoint.delete(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};