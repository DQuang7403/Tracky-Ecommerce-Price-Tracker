import mongoose from "mongoose";
const TrackedProductSchema = mongoose.Schema(
  {
    id: String,
    name: String,
    href: String,
  },
  { _id: false },
);
const FrequencyUpdateSchema = mongoose.Schema(
  {
    frequency: String,
    hour: String,
    minute: String,
    day: String,
    cronJobCode: String,
  },
  { _id: false },
);
const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    hashedPassword: {
      type: String,
    },
    trackedProducts: {
      type: [TrackedProductSchema],
      default: [],
    },
    signWithGoogle: {
      type: Boolean,
      required: true,
      default: false,
    },
    receiveGmail: {
      type: Boolean,
      default: false,
      required: true,
    },
    autoUpdate: {
      type: Boolean,
      default: false,
    },
    autoUpdateConfig: {
      type: FrequencyUpdateSchema,
      default: {
        frequency: "daily",
        hour: "00",
        minute: "00",
        day: "Mon",
        cronJobCode: "0 0 * * *",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
