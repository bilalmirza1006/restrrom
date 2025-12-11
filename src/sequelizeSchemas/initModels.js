// initModels.js
import { MODEL_CLASSES, globalModelOptions } from './models.js';

export function initModels(sequelize) {
  const instances = {};
  for (const { cls, name, attrs } of MODEL_CLASSES) {
    cls.init(attrs, {
      sequelize,
      modelName: name,
      ...globalModelOptions,
    });
    instances[name] = cls;
  }
  return instances;
}
