import db from '../config/database.js';
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';
import Appointment from '../models/appointment.js';
import MedicalRecord from '../models/medicalRecord.js';

export const getPatientProfile = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;

    const user = await User.findOne(
      { id: userId },
      { _id: 0, id: 1, name: 1, email: 1, role: 1 }
    ).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const patient = await Patient.findOne({ user_id: userId }, { _id: 0 }).lean();

    res.json({
      user,
      profile: patient || null
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;
    const { phone, address, date_of_birth, gender, emergency_contact } = req.body;

    // Update user
    if (req.body.name || req.body.email) {
      const updates = {};
      if (req.body.name) {
        updates.name = req.body.name;
      }
      if (req.body.email) {
        updates.email = req.body.email;
      }

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ id: userId }, { $set: updates });
      }
    }

    // Update or create patient profile
    const existingPatient = await Patient.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();

    if (existingPatient) {
      const updates = {};
      if (phone !== undefined) { updates.phone = phone; }
      if (address !== undefined) { updates.address = address; }
      if (date_of_birth !== undefined) { updates.date_of_birth = date_of_birth; }
      if (gender !== undefined) { updates.gender = gender; }
      if (emergency_contact !== undefined) { updates.emergency_contact = emergency_contact; }

      if (Object.keys(updates).length > 0) {
        await Patient.updateOne({ id: existingPatient.id }, { $set: updates });
      }
    } else {
      const getNextId = (await import('../models/getNextId.js')).default;
      const patientId = await getNextId('patients');
      await Patient.create({
        id: patientId,
        user_id: userId,
        phone: phone || null,
        address: address || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        emergency_contact: emergency_contact || null
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;

    const patient = await Patient.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patientId = patient.id;

    const records = await MedicalRecord.aggregate([
      { $match: { patient_id: patientId } },
      { $sort: { record_date: -1, created_at: -1 } },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor_id',
          foreignField: 'id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.user_id',
          foreignField: 'id',
          as: 'doctor_user'
        }
      },
      { $unwind: '$doctor_user' },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment_id',
          foreignField: 'id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: 1,
          patient_id: 1,
          doctor_id: 1,
          appointment_id: 1,
          diagnosis: 1,
          prescription: 1,
          notes: 1,
          record_date: 1,
          created_at: 1,
          updated_at: 1,
          doctor_name: '$doctor_user.name',
          specialization: '$doctor.specialization',
          appointment_date: '$appointment.appointment_date',
          appointment_time: '$appointment.appointment_time'
        }
      }
    ]);

    res.json({ records });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
