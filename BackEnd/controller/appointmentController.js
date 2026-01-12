import { promisePool } from '../config/database.js';
import { validationResult } from 'express-validator';

export const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, appointment_date, appointment_time, reason } = req.body;
    let patient_id = req.body.patient_id;

    // If user is a patient, get their patient_id from the database
    if (req.user.role === 'patient' && !patient_id) {
      const [patients] = await promisePool.execute(
        'SELECT id FROM patients WHERE user_id = ?',
        [req.user.id]
      );

      if (patients.length === 0) {
        return res.status(404).json({ message: 'Patient profile not found. Please complete your profile.' });
      }

      patient_id = patients[0].id;
    }

    if (!patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Check if patient exists
    const [patients] = await promisePool.execute(
      'SELECT id FROM patients WHERE id = ?',
      [patient_id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const [doctors] = await promisePool.execute(
      'SELECT id FROM doctors WHERE id = ?',
      [doctor_id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for double-booking
    const [existing] = await promisePool.execute(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
      [doctor_id, appointment_date, appointment_time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const [result] = await promisePool.execute(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [patient_id, doctor_id, appointment_date, appointment_time, reason || null]
    );

    // Get created appointment with details
    const [appointments] = await promisePool.execute(
      `SELECT a.*, 
       p.user_id as patient_user_id, u1.name as patient_name, u1.email as patient_email,
       d.user_id as doctor_user_id, u2.name as doctor_name, u2.email as doctor_email
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u1 ON p.user_id = u1.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u2 ON d.user_id = u2.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: appointments[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAppointments = async (req, res) => {
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

    // Role-based filtering
    if (req.user.role === 'patient') {
      const [patients] = await promisePool.execute(
        'SELECT id FROM patients WHERE user_id = ?',
        [req.user.id]
      );
      if (patients.length > 0) {
        query += ' AND a.patient_id = ?';
        params.push(patients[0].id);
      }
    } else if (req.user.role === 'doctor') {
      const [doctors] = await promisePool.execute(
        'SELECT id FROM doctors WHERE user_id = ?',
        [req.user.id]
      );
      if (doctors.length > 0) {
        query += ' AND a.doctor_id = ?';
        params.push(doctors[0].id);
      }
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (patient_id && req.user.role === 'admin') {
      query += ' AND a.patient_id = ?';
      params.push(patient_id);
    }

    if (doctor_id && req.user.role === 'admin') {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await promisePool.execute(query, params);

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [appointments] = await promisePool.execute(
      `SELECT a.*, 
       p.user_id as patient_user_id, u1.name as patient_name, u1.email as patient_email,
       d.user_id as doctor_user_id, u2.name as doctor_name, u2.email as doctor_email, d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u1 ON p.user_id = u1.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u2 ON d.user_id = u2.id
       WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    const appointment = appointments[0];
    if (req.user.role === 'patient') {
      const [patients] = await promisePool.execute(
        'SELECT id FROM patients WHERE user_id = ?',
        [req.user.id]
      );
      if (patients.length > 0 && appointment.patient_id !== patients[0].id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'doctor') {
      const [doctors] = await promisePool.execute(
        'SELECT id FROM doctors WHERE user_id = ?',
        [req.user.id]
      );
      if (doctors.length > 0 && appointment.doctor_id !== doctors[0].id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ appointment: appointments[0] });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointment_date, appointment_time, notes } = req.body;

    // Check if appointment exists
    const [appointments] = await promisePool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Authorization check
    if (req.user.role === 'patient' && status && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (appointment_date) {
      updates.push('appointment_date = ?');
      params.push(appointment_date);
    }

    if (appointment_time) {
      updates.push('appointment_time = ?');
      params.push(appointment_time);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await promisePool.execute(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated appointment
    const [updated] = await promisePool.execute(
      `SELECT a.*, 
       p.user_id as patient_user_id, u1.name as patient_name, u1.email as patient_email,
       d.user_id as doctor_user_id, u2.name as doctor_name, u2.email as doctor_email, d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u1 ON p.user_id = u1.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u2 ON d.user_id = u2.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      message: 'Appointment updated successfully',
      appointment: updated[0]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
