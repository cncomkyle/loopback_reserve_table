// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {LoggingBindings, logInvocation, WinstonLogger} from '@loopback/logging';
import {get, param, response, ResponseObject} from '@loopback/rest';
import {Query} from 'ottoman';
import tableModel from '../models/tables.model';
import {ottoman} from '../ottoman-global-config';

/**
 * OpenAPI response for gettableList()
 */
const gettableList_RESPONSE: ResponseObject = {
  description: 'gettableList Response',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        title: 'gettableList',
        items: {
          properties: {
            id: {type: 'string'},
            size: {type: 'number'},
            tableNo: {type: 'string'},
            headers: {
              type: 'object',
              properties: {
                'Content-Type': {type: 'string'},
              },
              additionalProperties: false,
            }
          },
        },
      },
    },
  },
};

export class TablesController {
  // Inject a winston logger
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  constructor() { }

  @get('/getTableList')
  @response(200, gettableList_RESPONSE)
  @logInvocation()
  @authenticate('jwt')
  async gettableList(): Promise<string> {

    const result = await tableModel.find({}, {consistency: 2});

    result.rows.forEach((row: any) => {
      console.log(row)
    })
    console.log('Result:', JSON.stringify(result.rows, null, 2));

    console.log("result x  is ", result);
    return result.rows;
  }

  @get('/getTableListWithSize/{size}')
  @logInvocation()
  async getTableListWithSize(@param.path.number('size') sizeNum: Number) {
    // Use the winston logger explicitly
    this.logger.log('info', `${sizeNum}`);
    const result = await tableModel.find({size: {$eq: sizeNum}}, {consistency: 2});
    return JSON.stringify(result.rows, null, 2);
  }

  @get('/getTableSummary')
  @logInvocation()
  async getTableSummary() {

    const params = {
      select: [
        {$field: 'size'},
        {
          $count: {
            $field: {
              name: 'size',
            },
            as: 'count',
          }
        },
      ],
      groupBy: [{expr: 'size'}]
    };

    const query = new Query(params, 'hilton_chbin.chbin_scope.tables').build();

    // this.logger.log('info', `${result}`);
    const response = await ottoman.query(query);

    return JSON.stringify(response.rows, null, 2);
  }


}
