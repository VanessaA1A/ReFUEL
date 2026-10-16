const db = require('../config/database');

class OilType {
  static async findAll(acceptedOnly = true) {
    let query = 'SELECT * FROM oil_types';
    if (acceptedOnly) query += ' WHERE accepted = TRUE';
    query += ' ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  }

  static async create({ name, description, accepted = true }) {
    const result = await db.query(
      `INSERT INTO oil_types (name, description, accepted) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, accepted]
    );
    return result.rows[0];
  }
}

module.exports = OilType;