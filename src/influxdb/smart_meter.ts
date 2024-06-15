import { Pointer } from './Influx';
import { SmartMeter } from '../aiseg2';
import { Point } from '@influxdata/influxdb-client';

export class SmartMeterPointer implements Pointer {
  constructor(private readonly smartMeter: SmartMeter) {}

  public points(): Point[] {
    return [
      new Point('SmartMeter')
        .tag('detail-type', 'power')
        .tag('detail-section', this.smartMeter.name)
        .floatField('value', this.smartMeter.value),
    ];
  }
}
