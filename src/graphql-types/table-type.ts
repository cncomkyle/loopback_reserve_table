// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {field, objectType} from '@loopback/graphql';
import {model} from '@loopback/repository';

@objectType({description: 'Object representing table'})
@model({settings: {strict: true}})
export class Table {
  @field(type => String)
  tableNo: String;
  @field(type => Number)
  size: Number;
  @field(type => String)
  id: String;
  @field(type => String)
  type: String;
  @field(type => String, {nullable: true, defaultValue: ""})
  userName: String;
  @field(type => String, {nullable: true, defaultValue: ""})
  mobile: String;
  @field(type => String, {nullable: true, defaultValue: ""})
  reserve_date_time: String;
  @field(type => String, {nullable: true, defaultValue: ""})
  status: String;
}
