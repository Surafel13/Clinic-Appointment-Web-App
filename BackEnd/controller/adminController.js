import { promisePool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
  try {
    const [stats] = await promisePool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_doctors,
        (SELECT COUNT(*) FROM appointments) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'approved') as approved_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'completed') as completed_appointments,
        (SELECT COUNT(*) FROM medical_records) as total_medical_records
    `);

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await promisePool.execute(query, params);

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
