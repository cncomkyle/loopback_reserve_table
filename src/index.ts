import {ApplicationConfig, StarterApplication} from './application';
import {ottoman} from "./ottoman-global-config";

import reservationsModel from './models/reservations.model';
import settingsModel from './models/settings.model';
import tableModel from './models/tables.model';
import usersModel from './models/users.model';



export * from './application';

async function initDBData(): Promise<void> {
  console.log("Begin initDBData")

  await tableModel.removeMany();
  // init tables
  for (var i = 1; i <= 5; i++) {
    const newTable = new tableModel({tableNo: '2_' + i, size: 2});
    await newTable.save();
  }

  for (var i = 1; i <= 10; i++) {
    const newTable = new tableModel({tableNo: '4_' + i, size: 4});
    await newTable.save();
  }

  for (var i = 1; i <= 2; i++) {
    const newTable = new tableModel({tableNo: '10_' + i, size: 10});
    await newTable.save();
  }

  // init settings
  await settingsModel.removeMany();
  const timeoutSetting = new settingsModel({name: "time_out", value: "15"});
  await timeoutSetting.save();

  const morningTimesetting = new settingsModel({name: "morning_start_time", value: "11:30"});
  await morningTimesetting.save();

  const afternoonTimesetting = new settingsModel({name: "afternoon_start_time", value: "11:30"});
  await afternoonTimesetting.save();

  // init users
  await usersModel.removeMany();
  const user_customer1 = new usersModel({role: "customer", userName: "customer1", password: "123456", mobile: "133456789", email: "customer1@test.com"});
  await user_customer1.save();

  const user_customer2 = new usersModel({role: "customer", userName: "customer2", password: "123456", mobile: "133456789", email: "customer2@test.com"});
  await user_customer2.save();

  const user_hilton = new usersModel({role: "employee", userName: "hilton", password: "123456", mobile: "133456789", email: "hilton@hilton.com"});
  await user_hilton.save();

  console.log("Begin initDBData")

}

export async function main(options: ApplicationConfig = {}) {
  // Init the couchbase connection through ottoman
  await ottoman.connect({
    connectionString: 'couchbase://localhost',
    bucketName: 'hilton_chbin',
    username: 'Administrator',
    password: '123456',
  });
  new tableModel({});
  new reservationsModel({});
  new settingsModel({});
  new usersModel({});

  await ottoman.start();
  await initDBData();

  const app = new StarterApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
