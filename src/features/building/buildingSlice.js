const { createSlice } = require('@reduxjs/toolkit');

const initialState = {
  // General Info
  buildingName: '',
  buildingImage: '',
  buildingThumbnail: '',
  buildingType: '',
  location: '',
  area: '',
  totalFloors: '',
  totalRestrooms: '',
  buildingManager: '',
  phone: '',

  // Building Model
  buildingModelPreview: null,
  buildingModelImage: null,
  buildingModelCoordinates: [],

  // Mapping
  mapInfo: {},
  latitude: '',
  longitude: '',

  // Restrooms
  restrooms: [],

  // Edit flags
  isEditMode: false,
  buildingId: null,
  isUserEdited: false,
  isGeneralEdit: false,
  isModelEdit: false,
  isMapEdit: false,
  isRestroomEdit: false,

  // API Data
  apiData: null,
  isLoading: false,
};

const buildingSlice = createSlice({
  name: 'building',
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
    setEditMode: (state, action) => {
      state.isEditMode = action.payload;
    },
    setBuildingId: (state, action) => {
      state.buildingId = action.payload;
    },
    setUserEdited: (state, action) => {
      // 🆕 added
      state.isUserEdited = action.payload;
    },
    setGeneralEdited: (state, action) => {
      // 🆕 added
      state.isGeneralEdit = action.payload;
    },
    setModelEdited: (state, action) => {
      // 🆕 added
      state.isModelEdit = action.payload;
    },
    setMapEdited: (state, action) => {
      // 🆕 added
      state.isMapEdit = action.payload;
    },
    setRestroomEdited: (state, action) => {
      // 🆕 added
      state.isRestroomEdit = action.payload;
    },
    setApiData: (state, action) => {
      state.apiData = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    resetBuildingState: () => initialState,
  },
});

export const {
  setBuilding,
  removeBuilding,
  addRestroom,
  updateRestroom,
  setRestrooms,
  setEditMode,
  setBuildingId,
  setUserEdited, // 🆕 export this
  setGeneralEdited,
  setModelEdited,
  setMapEdited,
  setRestroomEdited,
  setApiData,
  setLoading,
  resetBuildingState,
} = buildingSlice.actions;

export default buildingSlice;
