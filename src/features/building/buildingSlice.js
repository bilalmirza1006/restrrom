const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  buildingName: "",
  buildingImage: "",
  buildingThumbnail: "",
  buildingType: "",
  location: "",
  area: "",
  totalFloors: "",
  totalRestrooms: "",
  buildingManager: "",
  phone: "",
  buildingModelPreview: null,
  buildingModelImage: null,
  buildingModelCoordinates: [],
  mapInfo: {},
  restrooms: [],
};

const buildingSlice = createSlice({
  name: "building",
  initialState,
  reducers: {
    setBuilding: (state, action) => {
      const payload = action.payload || {};
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          state[key] = value;
        }
      });
    },
    addRestroom: (state, action) => {
      state.restrooms.push(action.payload);
    },
    updateRestroom: (state, action) => {
      const { index, data } = action.payload;
      if (state.restrooms[index]) {
        state.restrooms[index] = data;
      }
    },
    setRestrooms: (state, action) => {
      state.restrooms = action.payload;
    },
    removeBuilding: () => initialState,
  },
});

export const { setBuilding, removeBuilding, addRestroom, updateRestroom, setRestrooms } = buildingSlice.actions;
export default buildingSlice;
