// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {get} from '@loopback/rest';

import {Bucket, Ottoman, Schema, set} from "ottoman";

import {QueryResult} from 'couchbase';

// Setting Ottoman in debuggin mode
set('DEBUG', true);

export class HelloController {
  @get('/hello')
  hello(): string {
    // HelloController.chbbintest().then(result => console.log(result));
    return 'Hello world!';
  }


  @get('/gettables')
  async gettables(): Promise<string> {
    let result: string = 'xxxx';

    result = await HelloController.getTables();

    console.log("result x  is ", result);
    return result;
  }

  // static async chbbintest(): Promise<string> {
  //   const clusterConnStr: string =
  //     'couchbase://localhost'
  //   const username: string = 'Administrator'
  //   const password: string = '123456'
  //   const bucketName: string = 'travel-sample'

  //   const cluster: Cluster = await couchbase.connect(clusterConnStr, {
  //     username: username,
  //     password: password
  //   })

  //   const bucket: Bucket = cluster.bucket(bucketName)

  //   const queryResult: QueryResult = await bucket
  //     .scope('inventory')
  //     .query('SELECT name FROM `airline` WHERE country=$1 LIMIT 10', {
  //       parameters: ['United States'],
  //     })

  //   console.log('Query Results:')
  //   queryResult.rows.forEach((row) => {
  //     console.log(row)
  //   })


  //   console.log("finish")

  //   return "test"
  // }


  // static async getTableList(): Promise<string> {
  //   const clusterConnStr: string =
  //     'couchbase://localhost'
  //   const username: string = 'Administrator'
  //   const password: string = '123456'
  //   const bucketName: string = 'hilton_chbin'
  //   const scopeName: string = 'chbin_scope'

  //   const cluster: Cluster = await couchbase.connect(clusterConnStr, {
  //     username: username,
  //     password: password
  //   })

  //   const bucket: Bucket = cluster.bucket(bucketName)

  //   const queryResult: QueryResult = await bucket
  //     .scope(scopeName)
  //     .query('SELECT size, tableNo, meta().id FROM tables')

  //   console.log('Query Results:')
  //   queryResult.rows.forEach((row) => {
  //     console.log(row)
  //   })


  //   console.log("finish")

  //   return "test"
  // }


  static async getSettings(): Promise<string> {

    console.log("finish")

    const ottoman = new Ottoman({
      scopeName: 'chbin_scope'
    });

    await ottoman.connect({
      connectionString: 'couchbase://localhost',
      bucketName: 'hilton_chbin',
      username: 'Administrator',
      password: '123456',
    });

    const Settings = ottoman.model('settings', {name: String, value: String});


    const setting = new Settings({name: 'testSetting', value: "9999", id: "100"});

    await ottoman.start();
    // Settings.dropCollection('Settings', '_default');

    await setting.save();
    console.log('Nice Job!');

    await ottoman.close();

    return "test"
  }


  static async getTables(): Promise<string> {
    console.log("finish")
    const ottoman = new Ottoman({
      scopeName: 'chbin_scope'
    });

    await ottoman.connect({
      connectionString: 'couchbase://localhost',
      bucketName: 'hilton_chbin',
      username: 'Administrator',
      password: '123456',
    });

    const tablesSchema = new Schema({
      tableNo: String,
      size: Number,
      id: Number,
      type: String,
    });

    const tableModel = ottoman.model(
      'tables', // Model name (collection)
      tablesSchema, // Schema defined
      {
        modelKey: 'type', // Ottoman by default use `_type`
        scopeName: 'chbin_scope', // Collection scope
        keyGeneratorDelimiter: '_', // By default Ottoman use ::
      });

    // const tableModel = ottoman.model('tables', {tableNo: String, size: String});

    await ottoman.start();
    // Settings.dropCollection('Settings', '_default');

    const newTable = new tableModel({tableNo: '100', size: 99});
    await newTable.save();
    // await ottoman.close();

    // await ottoman.start();
    const result = await tableModel.find({}, {consistency: 2});

    result.rows.forEach((row: any) => {
      console.log(row)
    })
    console.log('Result:', JSON.stringify(result.rows, null, 2));

    const bucket: Bucket = ottoman.cluster.bucket("hilton_chbin")

    const queryResult: QueryResult = await bucket
      .scope('chbin_scope')
      .query('SELECT size, tableNo, meta().id FROM tables')

    queryResult.rows.forEach((row) => {
      console.log(row)
    })

    // await tableModel.removeMany({});
    await ottoman.close();


    return JSON.stringify(result.rows, null, 2)
  }



}
