import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import db from '../config/database.js';
import getNextId from '../models/getNextId.js';
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';

export const register = async (req, res) => {
  try {
    await db.connect();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address, date_of_birth, gender, specialization } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUser;
    let createdPatientId;
    let createdDoctorId;
    try {
      const userId = await getNextId('users');
      createdUser = await User.create({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: role || 'patient'
      });

      if (role === 'patient') {
        const patientId = await getNextId('patients');
        createdPatientId = patientId;
        await Patient.create({
          id: patientId,
          user_id: userId,
          phone: phone || null,
          address: address || null,
          date_of_birth: date_of_birth || null,
          gender: gender || null
        });
      } else if (role === 'doctor') {
        const doctorId = await getNextId('doctors');
        createdDoctorId = doctorId;
        await Doctor.create({
          id: doctorId,
          user_id: userId,
          specialization: specialization || null,
          phone: phone || null,
          address: address || null
        });
      }

      const token = jwt.sign(
        { id: userId, email, role: role || 'patient' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          name,
          email,
          role: role || 'patient'
        }
      });
    } catch (error) {
      if (createdPatientId !== undefined) {
        await Patient.deleteOne({ id: createdPatientId });
      }
      if (createdDoctorId !== undefined) {
        await Doctor.deleteOne({ id: createdDoctorId });
      }
      if (createdUser) {
        await User.deleteOne({ id: createdUser.id });
      }
      throw error;
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    await db.connect();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    await db.connect();

    const userId = req.user.id;

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
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
