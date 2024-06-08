import { DetailUsagePower, PowerSummary } from '../aiseg2';
import { Pointer } from './Influx';
import { Point } from '@influxdata/influxdb-client';

export class PowerSummaryPointer implements Pointer {
  constructor(private readonly powerSummary: PowerSummary) {
    this.powerSummary = powerSummary;
  }

  public points(): Point[] {
    const totalGenerationPowerPoint = new Point('power')
      .tag('summary', this.powerSummary.totalGenerationPowerKW.name)
      .floatField('value', this.powerSummary.totalGenerationPowerKW.value);
    const totalUsagePowerPoint = new Point('power')
      .tag('summary', this.powerSummary.totalUsagePowerKW.name)
      .floatField('value', this.powerSummary.totalUsagePowerKW.value);
    const totalBalancePowerPoint = new Point('power')
      .tag('summary', this.powerSummary.totalBalancePowerKW.name)
      .floatField('value', this.powerSummary.totalBalancePowerKW.value);

    const points = [totalGenerationPowerPoint, totalUsagePowerPoint, totalBalancePowerPoint];
    this.powerSummary.detailsGenerationPower.forEach((item) => {
      const itemPoint = new Point('power')
        .tag('detail-type', 'generation')
        .tag('detail-section', item.name)
        .floatField('value', item.value);
      points.push(itemPoint);
    });
    return points;
  }
}

export class DetailUsagePowerPointer implements Pointer {
  constructor(private readonly detailsUsagePower: DetailUsagePower) {
    this.detailsUsagePower = detailsUsagePower;
  }

  public points(): Point[] {
    return this.detailsUsagePower.map((item) => {
      return new Point('power')
        .tag('detail-type', 'usage')
        .tag('detail-section', item.name)
        .floatField('value', item.value);
    });
  }
}
