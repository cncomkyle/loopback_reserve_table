import {model, Schema} from 'ottoman';

const settingsSchema = new Schema({
  name: {type: String, required: true},
  value: {type: String, required: true},
  id: String,
  type: String,
});

const settingsModel = model(
  'settings', // Model name (collection)
  settingsSchema, // Schema defined
  {
    modelKey: 'type', // Ottoman by default use `_type`
    scopeName: 'chbin_scope', // Collection scope
    keyGeneratorDelimiter: '_', // By default Ottoman use ::
  });

export default settingsModel;
