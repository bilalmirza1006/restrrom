const { imageSchema } = require("./global.model");

const restroomSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    restroomModelImage: {
      type: [imageSchema],
      required: true,
    },
    restroomModelCoordinates: {
      type: Array,
      required: true,
    },
    sensors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sensor",
      },
    ],
  },
  { timestamps: true }
);

export const RestRoom =
  mongoose.models.RestRoom || mongoose.model("RestRoom", restroomSchema);
