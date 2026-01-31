import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    user_id: { type: Number, required: true, unique: true, index: true },
    specialization: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    license_number: { type: String, default: null },
    experience_years: { type: Number, default: null },
    bio: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false
  }
);

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
