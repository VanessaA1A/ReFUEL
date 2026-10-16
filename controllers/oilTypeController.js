const OilType = require('../models/OilType');

exports.list = async (req, res, next) => {
  try {
    const acceptedOnly = req.query.all !== 'true';
    const types = await OilType.findAll(acceptedOnly);
    res.json(types);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const type = await OilType.create(req.body);
    res.status(201).json(type);
  } catch (err) { next(err); }
};