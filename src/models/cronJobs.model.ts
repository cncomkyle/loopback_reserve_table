import {model, Schema} from 'ottoman';

const cronJobsSchema = new Schema({
  reservationId: {type: String, required: true},
  trigger_data_time: {type: Number, required: true},
  status: {type: String, required: true},
  id: String,
  type: String,
});

const cronJobsModel = model(
  'cronJobs', // Model name (collection)
  cronJobsSchema, // Schema defined
  {
    modelKey: 'type', // Ottoman by default use `_type`
    scopeName: 'chbin_scope', // Collection scope
    keyGeneratorDelimiter: '_', // By default Ottoman use ::
  });

export default cronJobsModel;
