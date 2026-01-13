import { promisePool } from '../config/database.js';

export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await promisePool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [patients] = await promisePool.execute(
      'SELECT * FROM patients WHERE user_id = ?',
      [userId]
    );

    res.json({
      user: users[0],
      profile: patients[0] || null
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, address, date_of_birth, gender, emergency_contact } = req.body;

    // Update user
    if (req.body.name || req.body.email) {
      const updates = [];
      const params = [];
      
      if (req.body.name) {
        updates.push('name = ?');
        params.push(req.body.name);
      }
      if (req.body.email) {
        updates.push('email = ?');
        params.push(req.body.email);
      }
      
      params.push(userId);
      await promisePool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Update or create patient profile
    const [patients] = await promisePool.execute(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length > 0) {
      const updates = [];
      const params = [];

      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
      if (address !== undefined) { updates.push('address = ?'); params.push(address); }
      if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); params.push(date_of_birth); }
      if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
      if (emergency_contact !== undefined) { updates.push('emergency_contact = ?'); params.push(emergency_contact); }

      if (updates.length > 0) {
        params.push(patients[0].id);
        await promisePool.execute(
          `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }
    } else {
      await promisePool.execute(
        'INSERT INTO patients (user_id, phone, address, date_of_birth, gender, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, phone || null, address || null, date_of_birth || null, gender || null, emergency_contact || null]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const [patients] = await promisePool.execute(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patientId = patients[0].id;

    const [records] = await promisePool.execute(
      `SELECT mr.*, 
       u.name as doctor_name, d.specialization,
       a.appointment_date, a.appointment_time
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN appointments a ON mr.appointment_id = a.id
       WHERE mr.patient_id = ?
       ORDER BY mr.record_date DESC, mr.created_at DESC`,
      [patientId]
    );

    res.json({ records });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
