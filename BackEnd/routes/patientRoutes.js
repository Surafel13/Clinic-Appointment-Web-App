import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getPatientProfile,
  updatePatientProfile,
  getMedicalRecords
} from '../controller/patientController.js';

const router = express.Router();

router.get('/profile', authenticate, authorize('patient'), getPatientProfile);
router.put('/profile', authenticate, authorize('patient'), updatePatientProfile);
router.get('/medical-records', authenticate, authorize('patient'), getMedicalRecords);

export default router;
