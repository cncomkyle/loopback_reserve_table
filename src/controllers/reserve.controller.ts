// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {LoggingBindings, logInvocation, WinstonLogger} from '@loopback/logging';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {addMinutes, format, parse} from 'date-fns';
import {ReserveRequest} from '../models';
import reservationsModel from '../models/reservations.model';

import {QueryResult} from 'couchbase';
import {Bucket, DocumentNotFoundError} from 'ottoman';
import {ottoman} from "../ottoman-global-config";


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
  ): Promise<{status: number, message: string}> {
    this.logger.log('info', `request json is ${JSON.stringify(newReservation, null, 2)}`);

    // check whether exist one record with same username && Mobile && reserveDateTime
    const checkRlt: boolean = await this.checkExistReservation(
      newReservation.userName, newReservation.mobile, newReservation.reserve_date_time);

    if (checkRlt) {
      return {status: 201, message: "Same reservation exist"}
    }
    // check wheter matched size table available
    const newTableInfo = await this.getMatchedTable(
      newReservation.size, newReservation.reserve_date_time);

    this.logger.info(newTableInfo)
    if (newTableInfo && !newTableInfo.tableId) {
      return {status: 202, message: "Matched table unavaible now!"}
    }

    // save new reservation
    const reserveDate = parse(newReservation.reserve_date_time, 'yyyy/MM/dd HH:mm:ss', new Date());
    const newReservationModel = new reservationsModel({
      tableId: newTableInfo.tableId,
      tableNo: newTableInfo.tableNo,
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
    return {status: 200, message: "create new reservations"}
  }

  async getMatchedTable(
    size: number, reserve_date_time: string): Promise<{tableId: string, tableNo: string}> {

    try {
      const bucket: Bucket = ottoman.cluster.bucket("hilton_chbin")
      const queryResult: QueryResult = await bucket
        .scope('chbin_scope')
        .query(`select id
                        ,tableNo
                  from tables
                 where size = $SIZE
                  and id not in (
                    select raw tableId
                      FROM reservations
                     where status in ['booked', 'confirmed']
                      and size = $SIZE
                      and reserve_date_time = $DATETIME
                      ) limit 1`,
          {parameters: {SIZE: Number(size), DATETIME: reserve_date_time}},);

      if (queryResult && queryResult.rows.length == 1) {
        return {tableId: queryResult.rows[0].id, tableNo: queryResult.rows[0].tableNo};
      }
    } catch (error) {
      this.logger.error(error)
    }


    return {tableId: "", tableNo: ""};

  }

  async checkExistReservation(
    userName: string,
    mobile: string,
    reserve_date_time: string,):
    Promise<boolean> {
    let filter = {} as any;
    filter.userName = {$eq: userName};
    filter.mobile = {$eq: mobile};
    filter.reserve_date_time = {$eq: reserve_date_time};

    try {
      const result = await reservationsModel.findOne(filter, {consistency: 2});
      if (result) {
        return true;
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }

    return false;

  }


  @get('/getReservations')
  @logInvocation()
  // @authenticate('jwt')
  async getReservations(@param.query.string('userId') userId: string,
    @param.query.string('userName') userName: string,
    @param.query.string('mobile') mobile: string,
    @param.query.string('reserve_date') reserve_date: string,) {
    // Use the winston logger explicitly
    this.logger.log('info', `${userId}`);

    let filter = {} as any;

    if (userId && userId.trim().length) {
      filter.userId = {$eq: userId};
    }

    if (userName && userName.trim().length) {
      filter.userName = {$eq: userName};
    }

    if (mobile && mobile.trim().length) {
      filter.mobile = {$eq: mobile};
    }

    if (reserve_date && reserve_date.trim().length) {
      filter.reserve_date_time = {$like: reserve_date + '%'};
    }

    const result = await reservationsModel.find(filter, {consistency: 2, sort: {"reserve_date_time": 'DESC'}});
    return JSON.stringify(result.rows, null, 2);
  }

  @post('/updateStatus')
  @authenticate('jwt')
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
