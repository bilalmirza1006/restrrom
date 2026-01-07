// initModels.js
import { MODEL_CLASSES, globalModelOptions } from './models.js';

export function initModels(sequelize) {
  const models = {};
  for (const { cls, name, attrs } of MODEL_CLASSES) {
    // Create a dynamic subclass to avoid mutating the original class
    // This is crucial for handling multiple connections safely
    const DynamicModel = class extends cls { };

    DynamicModel.init(attrs, {
      sequelize,
      modelName: name,
      ...globalModelOptions,
    });
    models[name] = DynamicModel;
  }
  return models;
}
