import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: true}})
export class ReserveRequest extends Model {
  @property({
    type: 'string',
    required: false,
  })
  tableId: string;

  @property({
    type: 'string',
    required: false,
  })
  tableNo: string;

  @property({
    type: 'string',
    required: true,
  })
  size: number;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  userName: string;

  @property({
    type: 'string',
    required: true,
  })
  mobile: string;

  @property({
    type: 'string',
    required: true,
  })
  reserve_date_time: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ReserveRequest>) {
    super(data);
  }
}

export interface ReserveRequestRelations {
  // describe navigational properties here
}

export type ReserveRequestWithRelations = ReserveRequest & ReserveRequestRelations;
