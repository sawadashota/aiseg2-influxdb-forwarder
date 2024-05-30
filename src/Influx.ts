import { InfluxDB, WriteApi, Point } from '@influxdata/influxdb-client';
import { PowerSummary, DetailUsagePower, Climate } from './aiseg2';

export class Influx {
  private readonly writeClient: WriteApi;
  constructor(host: string, token: string, orgName: string, bucketName: string, useHTTPS: boolean) {
    const url = `${useHTTPS ? 'https' : 'http'}://${host}`;

    const client = new InfluxDB({ url, token });
    this.writeClient = client.getWriteApi(orgName, bucketName, 'ns');
  }

  public writePower(
    powerSummary: PowerSummary,
    detailsUsagePower: DetailUsagePower,
    climates: Climate[],
  ) {
    const totalGenerationPowerPoint = new Point('power')
      .tag('summary', powerSummary.totalGenerationPowerKW.name)
      .floatField('value', powerSummary.totalGenerationPowerKW.value);
    const totalUsagePowerPoint = new Point('power')
      .tag('summary', powerSummary.totalUsagePowerKW.name)
      .floatField('value', powerSummary.totalUsagePowerKW.value);
    const totalBalancePowerPoint = new Point('power')
      .tag('summary', powerSummary.totalBalancePowerKW.name)
      .floatField('value', powerSummary.totalBalancePowerKW.value);

    this.writeClient.writePoint(totalGenerationPowerPoint);
    this.writeClient.writePoint(totalUsagePowerPoint);
    this.writeClient.writePoint(totalBalancePowerPoint);

    powerSummary.detailsGenerationPower.forEach((item) => {
      const itemPoint = new Point('power')
        .tag('detail-type', 'generation')
        .tag('detail-section', item.name)
        .floatField('value', item.value);
      this.writeClient.writePoint(itemPoint);
    });

    detailsUsagePower.forEach((item) => {
      const itemPoint = new Point('power')
        .tag('detail-type', 'usage')
        .tag('detail-section', item.name)
        .floatField('value', item.value);
      this.writeClient.writePoint(itemPoint);
    });

    climates.forEach((item) => {
      const temperaturePoint = new Point('climate')
        .tag('detail-type', 'temperature')
        .tag('detail-section', item.name)
        .floatField('value', item.temperature);
      const humidityPoint = new Point('climate')
        .tag('detail-type', 'humidity')
        .tag('detail-section', item.name)
        .floatField('value', item.humidity);

      this.writeClient.writePoint(temperaturePoint);
      this.writeClient.writePoint(humidityPoint);
    });

    this.writeClient.close().then(() => {
      console.log('WRITE FINISHED');
    });
  }
}
