import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { imageSchema } from './global.model.js';

const authSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'building_manager',
        'report_manager',
        'subscription_manager',
        'building_inspector',
      ],
      default: 'admin',
    },
    dob: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    gender: { type: String, default: null },
    nationality: { type: String, default: null },
    image: { type: imageSchema, default: null },
    interval: { type: Number, default: 30 },
    isCustomDb: { type: Boolean, default: false },
    customDbHost: { type: String, default: null },
    customDbPassword: { type: String, default: null },
    customDbUsername: { type: String, default: null },
    customDbName: { type: String, default: null },
    customDbPort: { type: Number, default: null },
    isCustomDbConnected: { type: Boolean, default: false },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscriber',
      default: null,
    },
    isTrialDone: { type: Boolean, default: false },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', default: null },

    // ✅ New field — only used for inspectors
    assignedBuildings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        default: [],
      },
    ],
  },
  { timestamps: true }
);

// ✅ Hide assignedBuildings unless user is inspector
authSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.role !== 'building_inspector') {
    delete obj.assignedBuildings;
  }
  return obj;
};

// ✅ Compare password
authSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// ✅ Hash password before save
authSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

export const Auth = mongoose.models.Auth || mongoose.model('Auth', authSchema);
