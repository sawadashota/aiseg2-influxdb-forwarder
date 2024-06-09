import dayjs from 'dayjs';
import { AiSEG2, AiSEG2Error } from './aiseg2';
import { Config } from './Config';
import {
  Influx,
  PowerSummaryPointer,
  DetailUsagePowerPointer,
  ClimatesPointer,
  DailyTotalTotalPointer,
} from './influxdb';
import { CircuitDailyTotalTotalPointer } from './influxdb/circuit_daily_total';

Config.checkEnvFile();

const aiseg2Host = Config.getAisegHost();
const aiseg2User = Config.getAisegUser();
const aiseg2Password = Config.getAisegPassword();
const aiseg2UseHTTPS = Config.getAisegUseHTTPS();

const influxdbHost = Config.getInfluxdbHost();
const influxdbToken = Config.getInfluxdbToken();
const influxdbOrg = Config.getInfluxdbOrg();
const influxdbBucket = Config.getInfluxdbBucket();
const influxdbUseHTTPS = Config.getInfluxdbUseHTTPS();

console.log('aiseg2Host', aiseg2Host);
console.log('aiseg2User', aiseg2User);
console.log('aiseg2UseHTTPS', aiseg2UseHTTPS);
console.log('influxdbHost', influxdbHost);
console.log('influxdbOrg', influxdbOrg);
console.log('influxdbBucket', influxdbBucket);
console.log('influxdbUseHTTPS', influxdbUseHTTPS);
const influx = new Influx(
  influxdbHost,
  influxdbToken,
  influxdbOrg,
  influxdbBucket,
  influxdbUseHTTPS,
);
const aiseg2 = new AiSEG2(aiseg2Host, aiseg2User, aiseg2Password, aiseg2UseHTTPS);

async function run(): Promise<void> {
  await Promise.all([stat(), total()]);
  return Promise.resolve();
}

async function stat(): Promise<void> {
  async function main(now = dayjs()) {
    const powerSummary = await aiseg2.power.getPowerSummary();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'powerSummary', powerSummary);

    const detailsUsagePower = await aiseg2.power.getDetailsUsagePower();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'detailsUsagePower', detailsUsagePower);

    const climates = await aiseg2.climate.getClimates();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'climates', climates);

    // influxdb へデータを送信
    influx.write([
      new PowerSummaryPointer(powerSummary),
      new DetailUsagePowerPointer(detailsUsagePower),
      new ClimatesPointer(climates),
    ]);
  }

  async function interval(microSeconds: number) {
    for (;;) {
      try {
        await main();
      } catch (error) {
        if (error instanceof AiSEG2Error) {
          console.error(`AiSEG2 Error: ${error.message}. Retry after 5 seconds.`);
        } else {
          console.error(`Unexpected Error: ${typeof error}: ${error}`);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, microSeconds));
    }
  }

  await interval(5000);
}

async function total(): Promise<void> {
  async function main(now = dayjs()) {
    now = now.startOf('day');
    const dailyTotalPowerGeneration = await aiseg2.dailyTotalPowerGeneration.getDailyTotal(now);
    console.log(
      now.format('YYYY-MM-DD HH:mm:ss'),
      'dailyTotalPowerGeneration',
      dailyTotalPowerGeneration,
    );

    const dailyTotalPowerBuying = await aiseg2.dailyTotalPowerBuying.getDailyTotal(now);
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'dailyTotalPowerBuying', dailyTotalPowerBuying);

    const dailyTotalPowerSelling = await aiseg2.dailyTotalPowerSelling.getDailyTotal(now);
    console.log(
      now.format('YYYY-MM-DD HH:mm:ss'),
      'dailyTotalPowerSelling',
      dailyTotalPowerSelling,
    );

    const dailyTotalPowerUsage = await aiseg2.dailyTotalPowerUsage.getDailyTotal(now);
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'dailyTotalPowerUsage', dailyTotalPowerUsage);

    const dailyTotalHotWaterUsage = await aiseg2.dailyTotalHotWaterUsage.getDailyTotal(now);
    console.log(
      now.format('YYYY-MM-DD HH:mm:ss'),
      'dailyTotalHotWaterUsage',
      dailyTotalHotWaterUsage,
    );

    const dailyTotalGasUsage = await aiseg2.dailyTotalGasUsage.getDailyTotal(now);
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'dailyTotalGasUsage', dailyTotalGasUsage);

    // influxdb へデータを送信
    influx.write([
      new DailyTotalTotalPointer([
        dailyTotalPowerGeneration,
        dailyTotalPowerBuying,
        dailyTotalPowerSelling,
        dailyTotalPowerUsage,
        dailyTotalHotWaterUsage,
        dailyTotalGasUsage,
      ]),
    ]);

    const dailyTotalPowerUsageEV =
      await aiseg2.circuitDailyTotalPowerUsageEV.getCircuitDailyTotal(now);
    console.log(
      now.format('YYYY-MM-DD HH:mm:ss'),
      'dailyTotalPowerUsageEV',
      dailyTotalPowerUsageEV,
    );

    influx.write([new CircuitDailyTotalTotalPointer([dailyTotalPowerUsageEV])]);
  }

  async function interval(microSeconds: number) {
    for (;;) {
      try {
        await main();
      } catch (error) {
        if (error instanceof AiSEG2Error) {
          console.error(`AiSEG2 Error: ${error.message}. Retry after 10 seconds.`);
        } else {
          console.error(`Unexpected Error: ${typeof error}: ${error}`);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, microSeconds));
    }
  }

  // 過去のデータを取得
  const days = 30;
  for (let i = 1; i <= days; i++) {
    await main(dayjs().subtract(i, 'day'));
  }

  await interval(10000);
}

const cleanup = async () => {
  await influx.close();
  console.log('influxdb closed.');
};

const exit = () => {
  cleanup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};

process.on('SIGINT', () => {
  console.log('SIGINT signal received.');
  exit();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');
  exit();
});

process.on('exit', (code) => {
  console.log(`Process exit with code: ${code}`);
});

run().finally(exit);
