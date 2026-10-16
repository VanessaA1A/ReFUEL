const db = require('../config/database');

class CollectionPoint {
  static async findAll({ city, activeOnly = true } = {}) {
    let query = 'SELECT * FROM collection_points WHERE 1=1';
    const params = [];
    if (activeOnly) query += ' AND is_active = TRUE';
    if (city) {
      params.push(`%${city}%`);
      query += ` AND address ILIKE $${params.length}`;
    }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM collection_points WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { name, address, latitude, longitude, schedule, contact_phone } = data;
    const result = await db.query(
      `INSERT INTO collection_points (name, address, latitude, longitude, schedule, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, address, latitude, longitude, schedule, contact_phone]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await db.query(
      `UPDATE collection_points SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM collection_points WHERE id = $1', [id]);
  }

  static async findNearby({ latitude, longitude, radiusKm = 50 }) {
    const result = await db.query(
      `SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance_km
       FROM collection_points
       WHERE is_active = TRUE
         AND latitude IS NOT NULL
         AND longitude IS NOT NULL
       HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) <= $3
       ORDER BY distance_km ASC`,
      [latitude, longitude, radiusKm]
    );
    return result.rows;
  }
}

module.exports = CollectionPoint;