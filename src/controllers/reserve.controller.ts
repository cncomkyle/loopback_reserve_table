// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {inject} from '@loopback/core';
import {LoggingBindings, logInvocation, WinstonLogger} from '@loopback/logging';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {addMinutes, format, parse} from 'date-fns';
import {ReserveRequest} from '../models';
import reservationsModel from '../models/reservations.model';

import {DocumentNotFoundError} from 'ottoman';


interface updateReservationStatus {
  reservationId: string;
  status: string;
}

export class ReserveController {

  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  constructor() { }

  @post('/createReservation')
  // @authenticate('jwt')
  async create(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(ReserveRequest, {
          title: 'NewReservation',
        }),
      },
    },
  }) newReservation: ReserveRequest,
  ): Promise<String> {
    this.logger.log('info', `request json is ${JSON.stringify(newReservation, null, 2)}`);

    const reserveDate = parse(newReservation.reserve_date_time, 'yyyy/MM/dd HH:mm:ss', new Date());
    const newReservationModel = new reservationsModel({
      size: newReservation.size,
      userId: newReservation.userId,
      userName: newReservation.userName,
      mobile: newReservation.mobile,
      email: "test@test.com",
      status: "booked",
      operatorId: newReservation.userId,
      reserve_date_time: newReservation.reserve_date_time,
      timeout_date_time: format(addMinutes(reserveDate, 15), 'yyyy/MM/dd HH:mm:ss'),
    });


    await newReservationModel.save();
    // this.logger.log('info', `reservationsModel  is ${reservation}`);
    return "create new reservations"
  }


  @get('/getReservations')
  @logInvocation()
  // @authenticate('jwt')
  async getReservations(@param.query.string('userId') userId: string,) {
    // Use the winston logger explicitly
    this.logger.log('info', `${userId}`);

    if (userId && userId.trim().length) {
      const result = await reservationsModel.find({userId: {$eq: userId}}, {consistency: 2});
      return JSON.stringify(result.rows, null, 2);
    } else {
      const result = await reservationsModel.find({}, {consistency: 2});
      return JSON.stringify(result.rows, null, 2);
    }
  }

  @post('/updateStatus')
  // @authenticate('jwt')
  async updateStatus(
    @requestBody({
      description: 'update reservation status',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['reservationId', 'status'],
            properties: {
              reservationId: {
                type: 'string'
              },
              status: {
                type: 'string'
              },
            }
          },
        },
      },
    })
    data: updateReservationStatus,): Promise<String> {
    this.logger.log('info', `request reservationId is ${data.reservationId}`);

    try {
      const updateModel = await reservationsModel.findById(data.reservationId);
      updateModel.status = data.status;

      await reservationsModel.updateById(data.reservationId, updateModel);
    } catch (error) {
      console.error(error);

      if (error instanceof DocumentNotFoundError) {
        throw new HttpErrors.BadRequest("Invalid reservationId");
      }
    }

    return "update reservation status successfully"
  }

}
