import db from '../Config/database.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
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

    const [users] = await db.execute(query, params);

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get role-specific data
    if (user.role === 'patient') {
      const [patients] = await db.execute(
        'SELECT * FROM patients WHERE user_id = ?',
        [id]
      );
      user.profile = patients[0] || null;
    } else if (user.role === 'doctor') {
      const [doctors] = await db.execute(
        'SELECT * FROM doctors WHERE user_id = ?',
        [id]
      );
      user.profile = doctors[0] || null;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { status, patient_id, doctor_id } = req.query;

    let query = `SELECT a.*, 
      p.user_id as patient_user_id, u1.name as patient_name, u1.email as patient_email,
      d.user_id as doctor_user_id, u2.name as doctor_name, u2.email as doctor_email, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u2 ON d.user_id = u2.id
      WHERE 1=1`;

    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (patient_id) {
      query += ' AND a.patient_id = ?';
      params.push(patient_id);
    }

    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await db.execute(query, params);

    res.json({ appointments });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
