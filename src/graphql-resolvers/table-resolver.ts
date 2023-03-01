// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  GraphQLBindings, query, ResolverData
} from '@loopback/graphql';
import {Bucket} from 'ottoman';
import {ottoman} from '../ottoman-global-config';

import {Args, Resolver} from '@loopback/graphql';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import {QueryResult} from 'couchbase';
import {TableArgs} from '../graphql-types/table-input';
import {Table} from '../graphql-types/table-type';
import tableModel from '../models/tables.model';

@Resolver(Table)
export class TableResolver {
  @inject(LoggingBindings.WINSTON_LOGGER)
  private logger: WinstonLogger;

  constructor(
    @inject(GraphQLBindings.RESOLVER_DATA) private resolverData: ResolverData,
  ) { }

  @query(returns => [Table])
  async tables(@Args() {size}: TableArgs): Promise<Table[]> {
    let filter = {} as any;
    if (size && size > 0) {
      filter.size = {$eq: size};
    }
    const result = await tableModel.find(filter, {consistency: 2, sort: {"size": 'DESC'}});
    console.log('Result:', JSON.stringify(result.rows, null, 2));

    return result.rows;
  }


  @query(returns => [Table])
  async reservedTables(@Args() {size, reserve_date_time}: TableArgs): Promise<Table[]> {
    try {
      const bucket: Bucket = ottoman.cluster.bucket("hilton_chbin")
      const queryResult: QueryResult = await bucket
        .scope('chbin_scope')
        .query(`select a.size
                     , a.tableNo
                     , b.userName
                     , b.mobile
                     , b.reserve_date_time
                     , b.status
                  from (
                          select id as tableId, size, tableNo
                          from tables
                        ) a
                left join
                        ( select tableId
                              , size
                              , tableNo
                              , userName
                              , mobile
                              , reserve_date_time
                              , status
                           FROM reservations
                          where reserve_date_time = $DATETIME
                            and status  in ['booked', 'confirmed']
                          ) b
                  on a.tableId = b.tableId
                  order by b.reserve_date_time desc, a.size desc`,
          {parameters: {DATETIME: reserve_date_time}},);
      return queryResult.rows;

    } catch (error) {
      this.logger.error(error)
    }
    return [];
  }

}
