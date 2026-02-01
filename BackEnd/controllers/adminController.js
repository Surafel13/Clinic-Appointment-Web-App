import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';
import Appointment from '../models/appointment.js';
import MedicalRecord from '../models/medicalRecord.js';

export const getDashboardStats = async (req, res) => {
  try {

    const [
      total_patients,
      total_doctors,
      total_appointments,
      pending_appointments,
      approved_appointments,
      completed_appointments,
      total_medical_records
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'completed' }),
      MedicalRecord.countDocuments({})
    ]);

    res.json({
      stats: {
        total_patients,
        total_doctors,
        total_appointments,
        pending_appointments,
        approved_appointments,
        completed_appointments,
        total_medical_records
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {

    const { role } = req.query;

    const match = {};
    if (role) {
      match.role = role;
    }

    const users = await User.find(match, { _id: 0, id: 1, name: 1, email: 1, role: 1, created_at: 1 })
      .sort({ created_at: -1 })
      .lean();

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {

    const { id } = req.params;

    const userId = parseInt(id, 10);
    const user = await User.findOne(
      { id: userId },
      { _id: 0, id: 1, name: 1, email: 1, role: 1, created_at: 1 }
    ).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role-specific data
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user_id: userId }, { _id: 0 }).lean();
      user.profile = patient || null;
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: userId }, { _id: 0 }).lean();
      user.profile = doctor || null;
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

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await User.updateOne({ id: parseInt(id, 10) }, { $set: updates });

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

    const userId = parseInt(id, 10);
    const deletedUser = await User.findOneAndDelete({ id: userId }, { projection: { _id: 0, id: 1, role: 1 } }).lean();
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (deletedUser.role === 'patient') {
      const patient = await Patient.findOneAndDelete({ user_id: userId }, { projection: { _id: 0, id: 1 } }).lean();
      if (patient) {
        await Appointment.deleteMany({ patient_id: patient.id });
        await MedicalRecord.deleteMany({ patient_id: patient.id });
      }
    } else if (deletedUser.role === 'doctor') {
      const doctor = await Doctor.findOneAndDelete({ user_id: userId }, { projection: { _id: 0, id: 1 } }).lean();
      if (doctor) {
        await Appointment.deleteMany({ doctor_id: doctor.id });
        await MedicalRecord.deleteMany({ doctor_id: doctor.id });
      }
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
    const match = {};

    if (status) {
      match.status = status;
    }

    if (patient_id) {
      match.patient_id = parseInt(patient_id, 10);
    }

    if (doctor_id) {
      match.doctor_id = parseInt(doctor_id, 10);
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
          appointment_date: 1,
          appointment_time: 1,
          status: 1,
          reason: 1,
          notes: 1,
          created_at: 1,
          updated_at: 1,
          patient_user_id: '$patient.user_id',
          patient_name: '$patient_user.name',
          patient_email: '$patient_user.email',
          doctor_user_id: '$doctor.user_id',
          doctor_name: '$doctor_user.name',
          doctor_email: '$doctor_user.email',
          specialization: '$doctor.specialization'
        }
      }
    ]);

    res.json({ appointments });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

