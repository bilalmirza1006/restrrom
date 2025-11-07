// initModels.js
import { MODEL_CLASSES, globalModelOptions, baseAttrs } from './models.js';

export function initModels(sequelize) {
  const instances = {};
  for (const { cls, name } of MODEL_CLASSES) {
    cls.init(baseAttrs, {
      sequelize,
      modelName: name,
      ...globalModelOptions,
    });
    instances[name] = cls;
  }
  return instances;
}
