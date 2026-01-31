import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    patient_id: { type: Number, required: true, index: true },
    doctor_id: { type: Number, required: true, index: true },
    appointment_id: { type: Number, default: null, index: true },
    diagnosis: { type: String, default: null },
    prescription: { type: String, default: null },
    notes: { type: String, default: null },
    record_date: { type: String, required: true }
  },
  {
    collection: 'medical_records',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);
