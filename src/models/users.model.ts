import {model, Schema} from 'ottoman';

const usersSchema = new Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  mobile: {type: String, required: true},
  id: String,
  type: String,
});

const usersModel = model(
  'users', // Model name (collection)
  usersSchema, // Schema defined
  {
    modelKey: 'type', // Ottoman by default use `_type`
    scopeName: 'chbin_scope', // Collection scope
    keyGeneratorDelimiter: '_', // By default Ottoman use ::
  });

export default usersModel;
