const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  buildingName: "",
  buildingImage: "",
  buildingType: "",
  location: "",
  area: "",
  totalFloors: "",
  totalRestrooms: "",
  buildingManager: "",
  phone: "",
  buildingModelPreview: null,
  buildingModelCoordinates: [],
  mapInfo: {},
  restrooms: [],
};

const buildingSlice = createSlice({
  name: "building",
  initialState,
  reducers: {
    setBuilding: (state, action) => {
      const {
        buildingName,
        buildingImage,
        buildingType,
        location,
        area,
        totalFloors,
        totalRestrooms,
        buildingManager,
        phone,
        buildingModelPreview,
        buildingModelCoordinates,
        mapInfo,
      } = action.payload;

      state.buildingName = buildingName || state.buildingName;
      state.buildingImage = buildingImage || state.buildingImage;
      state.buildingType = buildingType || state.buildingType;
      state.location = location || state.location;
      state.area = area || state.area;
      state.totalFloors = totalFloors || state.totalFloors;
      state.totalRestrooms = totalRestrooms || state.totalRestrooms;
      state.buildingManager = buildingManager || state.buildingManager;
      state.phone = phone || state.phone;
      state.buildingModelPreview =
        buildingModelPreview || state.buildingModelPreview;
      state.buildingModelCoordinates =
        buildingModelCoordinates || state.buildingModelCoordinates;
      state.mapInfo = mapInfo || state.mapInfo;
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

export const {
  setBuilding,
  removeBuilding,
  addRestroom,
  updateRestroom,
  setRestrooms,
} = buildingSlice.actions;
export default buildingSlice;
