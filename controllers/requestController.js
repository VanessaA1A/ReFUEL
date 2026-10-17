const RecyclingRequest = require('../models/RecyclingRequest');
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const evidenceDirectory = path.join(__dirname, '..', 'uploads', 'evidence');

function evidenceExtension(file) {
  if (file.mimetype === 'image/jpeg' && file.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return '.jpg';
  if (file.mimetype === 'image/png' && file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (file.mimetype === 'image/webp' && file.buffer.toString('ascii', 0, 4) === 'RIFF' && file.buffer.toString('ascii', 8, 12) === 'WEBP') return '.webp';
  return null;
}

function sendEvidence(req, res, filename) {
  const safeFilename = path.basename(filename);
  res.sendFile(path.join(evidenceDirectory, safeFilename), (err) => {
    if (err && !res.headersSent) res.status(err.statusCode || 404).json({ message: 'No se encontró la evidencia' });
  });
}

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

exports.uploadEvidence = async (req, res, next) => {
  let savedPath;
  try {
    if (!req.file) return res.status(400).json({ message: 'Selecciona una foto de la cartilla' });
    const extension = evidenceExtension(req.file);
    if (!extension) return res.status(400).json({ message: 'El archivo no contiene una imagen JPEG, PNG o WebP válida' });

    const record = await RecyclingRequest.findEvidenceRecord(req.params.id, req.user.id, false);
    if (!record) return res.status(404).json({ message: 'No se encontró esa entrega' });
    if (record.status === 'completed') {
      return res.status(409).json({ message: 'No se puede cambiar la evidencia de una entrega completada' });
    }

    await fs.mkdir(evidenceDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    savedPath = path.join(evidenceDirectory, filename);
    await fs.writeFile(savedPath, req.file.buffer, { flag: 'wx' });

    const saved = await RecyclingRequest.saveEvidenceFilename(req.params.id, req.user.id, filename);
    if (!saved) {
      await fs.unlink(savedPath);
      return res.status(409).json({ message: 'La entrega ya fue completada y no admite cambios' });
    }

    if (record.evidence_filename) {
      await fs.unlink(path.join(evidenceDirectory, path.basename(record.evidence_filename))).catch(() => {});
    }
    res.status(201).json({ message: 'Foto de evidencia subida. Queda pendiente de revisión.', hasEvidence: true });
  } catch (err) {
    if (savedPath) await fs.unlink(savedPath).catch(() => {});
    next(err);
  }
};

exports.getEvidence = async (req, res, next) => {
  try {
    const record = await RecyclingRequest.findEvidenceRecord(
      req.params.id,
      req.user.id,
      req.user.role === 'admin'
    );
    if (!record || !record.evidence_filename) {
      return res.status(404).json({ message: 'No se encontró evidencia para esa entrega' });
    }
    sendEvidence(req, res, record.evidence_filename);
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
    if (!updated) {
      const current = await RecyclingRequest.findStatusInfo(req.params.id);
      if (!current) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
      if (status === 'confirmed' && !current.has_evidence) {
        return res.status(400).json({ message: 'No se puede confirmar la entrega sin una foto de evidencia' });
      }
      if (status === 'completed' && !current.has_evidence) {
        return res.status(400).json({ message: 'No se puede completar la entrega sin una foto de evidencia' });
      }
      if (status === 'completed' && current.status !== 'confirmed') {
        return res.status(409).json({ message: 'Primero debes confirmar la evidencia de la entrega' });
      }
      return res.status(409).json({ message: 'La entrega ya no admite ese cambio de estado' });
    }
    res.json(updated);
  } catch (err) { next(err); }
};