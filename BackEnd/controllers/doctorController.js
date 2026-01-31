import db from '../config/database.js';
import getNextId from '../models/getNextId.js';
import User from '../models/user.js';
import Doctor from '../models/doctor.js';
import Patient from '../models/patient.js';
import Appointment from '../models/appointment.js';
import MedicalRecord from '../models/medicalRecord.js';

export const getDoctorProfile = async (req, res) => {
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

    const doctor = await Doctor.findOne({ user_id: userId }, { _id: 0 }).lean();

    res.json({
      user,
      profile: doctor || null
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;
    const { specialization, phone, address, license_number, experience_years, bio } = req.body;

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

    // Update or create doctor profile
    const existingDoctor = await Doctor.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();

    if (existingDoctor) {
      const updates = {};
      if (specialization !== undefined) updates.specialization = specialization;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;
      if (license_number !== undefined) updates.license_number = license_number;
      if (experience_years !== undefined) updates.experience_years = experience_years;
      if (bio !== undefined) updates.bio = bio;

      if (Object.keys(updates).length > 0) {
        await Doctor.updateOne({ id: existingDoctor.id }, { $set: updates });
      }
    } else {
      const doctorId = await getNextId('doctors');
      await Doctor.create({
        id: doctorId,
        user_id: userId,
        specialization: specialization || null,
        phone: phone || null,
        address: address || null,
        license_number: license_number || null,
        experience_years: experience_years || null,
        bio: bio || null
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorId = doctor.id;
    const { status } = req.query;

    const match = { doctor_id: doctorId };
    if (status) {
      match.status = status;
    }

    const appointments = await Appointment.aggregate([
      { $match: match },
      { $sort: { appointment_date: -1, appointment_time: -1 } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient_id',
          foreignField: 'id',
          as: 'patient'
        }
      },
      { $unwind: '$patient' },
      {
        $lookup: {
          from: 'users',
          localField: 'patient.user_id',
          foreignField: 'id',
          as: 'patient_user'
        }
      },
      { $unwind: '$patient_user' },
      {
        $project: {
          _id: 0,
          id: 1,
          patient_id: 1,
          doctor_id: 1,
          appointment_date: 1,
          appointment_time: 1,
          status: 1,
          reason: 1,
          notes: 1,
          created_at: 1,
          updated_at: 1,
          patient_user_id: '$patient.user_id',
          patient_name: '$patient_user.name',
          patient_email: '$patient_user.email'
        }
      }
    ]);

    res.json({ appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    await db.connect();

    const doctors = await Doctor.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { 'user.name': 1 } },
      {
        $project: {
          _id: 0,
          id: 1,
          user_id: 1,
          specialization: 1,
          phone: 1,
          address: 1,
          license_number: 1,
          experience_years: 1,
          bio: 1,
          created_at: 1,
          updated_at: 1,
          name: '$user.name',
          email: '$user.email',
          created_at_user: '$user.created_at'
        }
      },
      { $addFields: { created_at: '$created_at_user' } },
      { $project: { created_at_user: 0 } }
    ]);

    res.json({ doctors });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;
    const { patient_id, appointment_id, diagnosis, prescription, notes, record_date } = req.body;

    // Get doctor ID
    const doctor = await Doctor.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorId = doctor.id;

    const recordId = await getNextId('medical_records');
    await MedicalRecord.create({
      id: recordId,
      patient_id: parseInt(patient_id, 10),
      doctor_id: doctorId,
      appointment_id: appointment_id !== undefined && appointment_id !== null ? parseInt(appointment_id, 10) : null,
      diagnosis: diagnosis || null,
      prescription: prescription || null,
      notes: notes || null,
      record_date: record_date || new Date().toISOString().split('T')[0]
    });

    const records = await MedicalRecord.aggregate([
      { $match: { id: recordId } },
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
          specialization: '$doctor.specialization'
        }
      }
    ]);

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
    await db.connect();

    const { id } = req.params;
    const { diagnosis, prescription, notes, record_date } = req.body;

    // Check if record exists and belongs to doctor
    const userId = req.user.id;
    const doctor = await Doctor.findOne({ user_id: userId }, { _id: 0, id: 1 }).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const recordId = parseInt(id, 10);
    const record = await MedicalRecord.findOne({ id: recordId, doctor_id: doctor.id }, { _id: 0 }).lean();
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Build update query
    const updates = {};
    if (diagnosis !== undefined) { updates.diagnosis = diagnosis; }
    if (prescription !== undefined) { updates.prescription = prescription; }
    if (notes !== undefined) { updates.notes = notes; }
    if (record_date !== undefined) { updates.record_date = record_date; }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await MedicalRecord.updateOne({ id: recordId }, { $set: updates });

    res.json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
