import { Point } from '@influxdata/influxdb-client';
import { Pointer } from './Influx';
import { DailyTotal } from '../aiseg2';

export class DailyTotalTotalPointer implements Pointer {
  constructor(private readonly totals: DailyTotal[]) {}

  public points(): Point[] {
    return this.totals.map((item) => {
      return new Point('day_total')
        .timestamp(item.date)
        .tag('detail-section', item.name)
        .floatField('value', item.value);
    });
  }
}
