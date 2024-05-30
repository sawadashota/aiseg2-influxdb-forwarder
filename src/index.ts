import dayjs from 'dayjs';
import { AiSEG2, AiSEG2Error } from './aiseg2';
import { Config } from './Config';
import { Influx } from './Influx';

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

async function run() {
  async function main(now = dayjs()) {
    // AiSEG2 からデータを取得
    const aiseg2 = new AiSEG2(aiseg2Host, aiseg2User, aiseg2Password, aiseg2UseHTTPS);

    const powerSummary = await aiseg2.power.getPowerSummary();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'powerSummary', powerSummary);

    const detailsUsagePower = await aiseg2.power.getDetailsUsagePower();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'detailsUsagePower', detailsUsagePower);

    const climates = await aiseg2.climate.getClimates();
    console.log(now.format('YYYY-MM-DD HH:mm:ss'), 'climates', climates);

    // influxdb へデータを送信
    const influx = new Influx(
      influxdbHost,
      influxdbToken,
      influxdbOrg,
      influxdbBucket,
      influxdbUseHTTPS,
    );
    influx.writePower(powerSummary, detailsUsagePower, climates);
  }

  async function interval(microSeconds: number) {
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, microSeconds));
      try {
        await main();
      } catch (error) {
        if (error instanceof AiSEG2Error) {
          console.error(`AiSEG2 Error: ${error.message}. Retry after 5 seconds.`);
        } else {
          console.error('Unexpected Error:', error);
          throw error;
        }
      }
    }
  }

  await interval(5000);
}

run();
