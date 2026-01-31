import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    user_id: { type: Number, required: true, unique: true, index: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    date_of_birth: { type: String, default: null },
    gender: { type: String, default: null },
    emergency_contact: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema);
