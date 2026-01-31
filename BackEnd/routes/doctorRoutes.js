import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getAllDoctors,
  createMedicalRecord,
  updateMedicalRecord
} from '../controllers/doctorController.js';

const router = express.Router();

// Public route to get all doctors (for booking)
router.get('/all', getAllDoctors);

// Doctor routes
router.get('/profile', authenticate, authorize('doctor'), getDoctorProfile);
router.put('/profile', authenticate, authorize('doctor'), updateDoctorProfile);
router.get('/appointments', authenticate, authorize('doctor'), getDoctorAppointments);
router.post('/medical-records', authenticate, authorize('doctor'), createMedicalRecord);
router.put('/medical-records/:id', authenticate, authorize('doctor'), updateMedicalRecord);

export default router;
