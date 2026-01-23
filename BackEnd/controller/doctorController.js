import db from '../Config/database.js';

export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [doctors] = await db.execute(
      'SELECT * FROM doctors WHERE user_id = ?',
      [userId]
    );

    res.json({
      user: users[0],
      profile: doctors[0] || null
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { specialization, phone, address, license_number, experience_years, bio } = req.body;

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
      await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Update or create doctor profile
    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length > 0) {
      const updates = [];
      const params = [];

      if (specialization !== undefined) { updates.push('specialization = ?'); params.push(specialization); }
      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
      if (address !== undefined) { updates.push('address = ?'); params.push(address); }
      if (license_number !== undefined) { updates.push('license_number = ?'); params.push(license_number); }
      if (experience_years !== undefined) { updates.push('experience_years = ?'); params.push(experience_years); }
      if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }

      if (updates.length > 0) {
        params.push(doctors[0].id);
        await db.execute(
          `UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }
    } else {
      await db.execute(
        'INSERT INTO doctors (user_id, specialization, phone, address, license_number, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, specialization || null, phone || null, address || null, license_number || null, experience_years || null, bio || null]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorId = doctors[0].id;
    const { status } = req.query;

    let query = `SELECT a.*, 
      p.user_id as patient_user_id, u1.name as patient_name, u1.email as patient_email
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      WHERE a.doctor_id = ?`;

    const params = [doctorId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await db.execute(query, params);

    res.json({ appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.*, u.name, u.email, u.created_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       ORDER BY u.name`
    );

    res.json({ doctors });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { patient_id, appointment_id, diagnosis, prescription, notes, record_date } = req.body;

    // Get doctor ID
    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorId = doctors[0].id;

    const [result] = await db.execute(
      'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes, record_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, doctorId, appointment_id || null, diagnosis || null, prescription || null, notes || null, record_date || new Date().toISOString().split('T')[0]]
    );

    // Get created record
    const [records] = await db.execute(
      `SELECT mr.*, 
       u.name as doctor_name, d.specialization
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE mr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Medical record created successfully',
      record: records[0]
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes, record_date } = req.body;

    // Check if record exists and belongs to doctor
    const userId = req.user.id;
    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [records] = await db.execute(
      'SELECT * FROM medical_records WHERE id = ? AND doctor_id = ?',
      [id, doctors[0].id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (diagnosis !== undefined) { updates.push('diagnosis = ?'); params.push(diagnosis); }
    if (prescription !== undefined) { updates.push('prescription = ?'); params.push(prescription); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (record_date !== undefined) { updates.push('record_date = ?'); params.push(record_date); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await db.execute(
      `UPDATE medical_records SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
