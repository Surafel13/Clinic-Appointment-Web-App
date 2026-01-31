import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    patient_id: { type: Number, required: true, index: true },
    doctor_id: { type: Number, required: true, index: true },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    reason: { type: String, default: null },
    status: { type: String, required: true },
    notes: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

appointmentSchema.index(
  { doctor_id: 1, appointment_date: 1, appointment_time: 1 },
  { unique: true }
);

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
