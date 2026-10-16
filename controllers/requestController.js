const RecyclingRequest = require('../models/RecyclingRequest');

exports.create = async (req, res, next) => {
  try {
    const { pointId, oilTypeId, estimatedLiters, pickupAddress, scheduledAt, notes } = req.body;
    if (!estimatedLiters || estimatedLiters <= 0) {
      return res.status(400).json({ message: 'Los litros estimados deben ser mayores a 0' });
    }
    const request = await RecyclingRequest.create({
      userId: req.user.id,
      pointId, oilTypeId, estimatedLiters,
      pickupAddress, scheduledAt, notes,
    });
    res.status(201).json(request);
  } catch (err) { next(err); }
};

exports.myRequests = async (req, res, next) => {
  try {
    const requests = await RecyclingRequest.findByUser(req.user.id);
    res.json(requests);
  } catch (err) { next(err); }
};

exports.listAll = async (req, res, next) => {
  try {
    const requests = await RecyclingRequest.findAll({ status: req.query.status });
    res.json(requests);
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Estado invalido' });
    }
    const updated = await RecyclingRequest.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.json(updated);
  } catch (err) { next(err); }
};