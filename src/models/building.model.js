const { default: mongoose } = require("mongoose");
const { imageSchema } = require("./global.model");

const buildingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    buildingThumbnail: { type: imageSchema, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    area: { type: String, required: true },
    totalFloors: { type: Number, required: true },
    buildingManager: { type: String, required: true },
    phone: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    images: { type: [imageSchema], required: true },
    location: { type: String, required: true },
    restRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "RestRoom" }],
    buildingModelImage: { type: imageSchema, required: true },
    buildingModleCoordinates: { type: Array, required: true },
  },
  { timestamps: true }
);

export const Building =
  mongoose.models.Building || mongoose.model("Building", buildingSchema);
