import { validationResult } from 'express-validator';
import db from '../config/database.js';
import getNextId from '../models/getNextId.js';
import Appointment from '../models/appointment.js';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';
import MedicalRecord from '../models/medicalRecord.js';

export const createAppointment = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, appointment_date, appointment_time, reason } = req.body;
    const requestedDoctorId = parseInt(doctor_id, 10);
    let patient_id = req.body.patient_id !== undefined && req.body.patient_id !== null
      ? parseInt(req.body.patient_id, 10)
      : undefined;

    // If user is a patient, get their patient_id from the database
    if (req.user.role === 'patient' && !patient_id) {
      const patient = await Patient.findOne(
        { user_id: req.user.id },
        { _id: 0, id: 1 }
      ).lean();

      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found. Please complete your profile.' });
      }

      patient_id = patient.id;
    }

    if (!patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Check if patient exists
    const patientExists = await Patient.exists({ id: patient_id });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.exists({ id: requestedDoctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for double-booking
    const existing = await Appointment.findOne({
      doctor_id: requestedDoctorId,
      appointment_date,
      appointment_time,
      status: { $ne: 'cancelled' }
    }, { _id: 0, id: 1 }).lean();

    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointmentId = await getNextId('appointments');
    await Appointment.create({
      id: appointmentId,
      patient_id,
      doctor_id: requestedDoctorId,
      appointment_date,
      appointment_time,
      reason: reason || null,
      status: 'pending'
    });

    const appointments = await Appointment.aggregate([
      { $match: { id: appointmentId } },
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
          doctor_email: '$doctor_user.email'
        }
      }
    ]);

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
    const match = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne(
        { user_id: req.user.id },
        { _id: 0, id: 1 }
      ).lean();
      if (patient) {
        match.patient_id = patient.id;
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne(
        { user_id: req.user.id },
        { _id: 0, id: 1 }
      ).lean();
      if (doctor) {
        match.doctor_id = doctor.id;
      }
    }

    if (status) {
      match.status = status;
    }

    if (patient_id && req.user.role === 'admin') {
      match.patient_id = parseInt(patient_id, 10);
    }

    if (doctor_id && req.user.role === 'admin') {
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
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {

    const { id } = req.params;
    const appointmentId = parseInt(id, 10);

    const appointments = await Appointment.aggregate([
      { $match: { id: appointmentId } },
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

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    const appointment = appointments[0];
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne(
        { user_id: req.user.id },
        { _id: 0, id: 1 }
      ).lean();
      if (patient && appointment.patient_id !== patient.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne(
        { user_id: req.user.id },
        { _id: 0, id: 1 }
      ).lean();
      if (doctor && appointment.doctor_id !== doctor.id) {
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
    const appointmentId = parseInt(id, 10);

    // Check if appointment exists
    const existingAppointment = await Appointment.findOne({ id: appointmentId }, { _id: 0 }).lean();
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = existingAppointment;

    // Authorization check
    if (req.user.role === 'patient' && status && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }

    // Build update query
    const updates = {};

    if (status) {
      updates.status = status;
    }

    if (appointment_date) {
      updates.appointment_date = appointment_date;
    }

    if (appointment_time) {
      updates.appointment_time = appointment_time;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await Appointment.updateOne({ id: appointmentId }, { $set: updates });

    const updated = await Appointment.aggregate([
      { $match: { id: appointmentId } },
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

    res.json({
      message: 'Appointment updated successfully',
      appointment: updated[0]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointmentId = parseInt(id, 10);
    const result = await Appointment.deleteOne({ id: appointmentId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await MedicalRecord.updateMany(
      { appointment_id: appointmentId },
      { $set: { appointment_id: null } }
    );

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
