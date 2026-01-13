import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/',
  authenticate,
  [
    body('doctor_id').notEmpty().withMessage('Doctor ID is required'),
    body('appointment_date').notEmpty().withMessage('Appointment date is required'),
    body('appointment_time').notEmpty().withMessage('Appointment time is required'),
  ],
  createAppointment
);

router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.put('/:id', authenticate, updateAppointment);
router.delete('/:id', authenticate, deleteAppointment);

export default router;
