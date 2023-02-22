import {model, Schema} from 'ottoman';

const reservationsSchema = new Schema({
  tableId: {type: String, required: false},
  tableNo: {type: String, required: false},
  size: {type: Number, required: true},
  userId: {type: String, required: true},
  userName: {type: String, required: true},
  email: {type: String, required: true},
  mobile: {type: String, required: true},
  status: {type: String, required: true},
  operatorId: {type: String, required: true},
  reserve_date_time: {type: String, required: true},
  timeout_date_time: {type: String, required: true},
  id: String,
  type: String,
}, {timestamps: true});


const reservationsModel = model(
  'reservations', // Model name (collection)
  reservationsSchema, // Schema defined
  {
    modelKey: 'type', // Ottoman by default use `_type`
    scopeName: 'chbin_scope', // Collection scope
    keyGeneratorDelimiter: '_', // By default Ottoman use ::
  });

export default reservationsModel;
