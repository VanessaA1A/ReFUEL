const db = require('../config/database');

class CollectionPoint {
  static async findAll({ city, activeOnly = true } = {}) {
    let query = 'SELECT * FROM collection_points WHERE 1=1';
    const params = [];
    if (activeOnly) {
      query += ' AND is_active = TRUE';
    }
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

  static async create({ name, address, latitude, longitude, schedule, contact_phone }) {
    const result = await db.query(
      `INSERT INTO collection_points (name, address, latitude, longitude, schedule, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, address, latitude, longitude, schedule, contact_phone]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const result = await db.query(
      `UPDATE collection_points SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM collection_points WHERE id = $1', [id]);
  }
}

module.exports = CollectionPoint;