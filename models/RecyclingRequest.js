const db = require('../config/database');

class RecyclingRequest {
  static async create({ userId, pointId, oilTypeId, estimatedLiters, pickupAddress, scheduledAt, notes }) {
    const result = await db.query(
      `INSERT INTO recycling_requests
       (user_id, point_id, oil_type_id, estimated_liters, pickup_address, scheduled_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, point_id, oil_type_id, estimated_liters, status,
           pickup_address, scheduled_at, completed_at, notes, created_at`,
      [userId, pointId, oilTypeId, estimatedLiters, pickupAddress, scheduledAt, notes]
    );
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await db.query(
      `SELECT r.id, r.user_id, r.point_id, r.oil_type_id, r.estimated_liters,
              r.status, r.pickup_address, r.scheduled_at, r.completed_at,
              r.notes, r.created_at,
              (r.evidence_filename IS NOT NULL) AS has_evidence,
              p.name AS point_name, o.name AS oil_type_name
       FROM recycling_requests r
       LEFT JOIN collection_points p ON r.point_id = p.id
       LEFT JOIN oil_types o ON r.oil_type_id = o.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findAll({ status } = {}) {
    let query = `SELECT r.id, r.user_id, r.point_id, r.oil_type_id, r.estimated_liters,
                        r.status, r.pickup_address, r.scheduled_at, r.completed_at,
                        r.notes, r.created_at,
                        (r.evidence_filename IS NOT NULL) AS has_evidence,
                        u.name AS user_name, p.name AS point_name, o.name AS oil_type_name
                 FROM recycling_requests r
                 JOIN users u ON r.user_id = u.id
                 LEFT JOIN collection_points p ON r.point_id = p.id
                 LEFT JOIN oil_types o ON r.oil_type_id = o.id`;
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE r.status = $${params.length}`;
    }
    query += ' ORDER BY r.created_at DESC';
    const result = await db.query(query, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE recycling_requests SET status = $1,
       completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $2 AND (
         (status = 'pending' AND (($1 = 'confirmed' AND evidence_filename IS NOT NULL) OR $1 = 'cancelled'))
         OR (status = 'confirmed' AND (($1 = 'completed' AND evidence_filename IS NOT NULL) OR $1 = 'cancelled'))
       )
       RETURNING id, status, completed_at`,
      [status, id]
    );
    return result.rows[0];
  }

  static async findEvidenceRecord(id, userId, isAdmin) {
    const result = await db.query(
      `SELECT evidence_filename, status FROM recycling_requests
       WHERE id = $1 AND (user_id = $2 OR $3 = TRUE)`,
      [id, userId, isAdmin]
    );
    return result.rows[0];
  }

  static async saveEvidenceFilename(id, userId, filename) {
    const result = await db.query(
      `UPDATE recycling_requests SET evidence_filename = $1, status = 'pending'
       WHERE id = $2 AND user_id = $3 AND status <> 'completed'
       RETURNING evidence_filename`,
      [filename, id, userId]
    );
    return result.rows[0];
  }

  static async findStatusInfo(id) {
    const result = await db.query(
      'SELECT id, status, (evidence_filename IS NOT NULL) AS has_evidence FROM recycling_requests WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = RecyclingRequest;