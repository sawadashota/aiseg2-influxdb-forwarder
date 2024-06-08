import { Point } from '@influxdata/influxdb-client';
import { Climate } from '../aiseg2';
import { Pointer } from './Influx';

export class ClimatesPointer implements Pointer {
  constructor(private readonly climates: Climate[]) {
    this.climates = climates;
  }

  public points(): Point[] {
    return this.climates
      .map((item) => {
        const temperaturePoint = new Point('climate')
          .tag('detail-type', 'temperature')
          .tag('detail-section', item.name)
          .floatField('value', item.temperature);
        const humidityPoint = new Point('climate')
          .tag('detail-type', 'humidity')
          .tag('detail-section', item.name)
          .floatField('value', item.humidity);
        return [temperaturePoint, humidityPoint];
      })
      .flat();
  }
}
