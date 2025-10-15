import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  kind: { 
    type: String, 
    enum: ['CONTRACT','LETTER','PAYSLIP','POLICY','OTHER'], 
    default: 'OTHER' 
  },
  title: { type: String, required: true },
  storageKey: { type: String, required: true }, // S3 key or local path
  mimeType: { type: String },
  originalName: { type: String, required: true }, // 👈 yeh add karo
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
