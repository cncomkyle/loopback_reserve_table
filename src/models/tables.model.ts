import {model, Schema} from 'ottoman';

const tablesSchema = new Schema({
  tableNo: String,
  size: Number,
  id: String,
  type: String,
});

const tableModel = model(
  'tables', // Model name (collection)
  tablesSchema, // Schema defined
  {
    modelKey: 'type', // Ottoman by default use `_type`
    scopeName: 'chbin_scope', // Collection scope
    keyGeneratorDelimiter: '_', // By default Ottoman use ::
  });

export default tableModel;
