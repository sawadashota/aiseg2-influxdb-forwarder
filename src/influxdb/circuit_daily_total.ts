import { Point } from '@influxdata/influxdb-client';
import { Pointer } from './Influx';
import { CircuitDailyTotal } from '../aiseg2/CircuitDailyTotalClient';

export class CircuitDailyTotalTotalPointer implements Pointer {
  constructor(private readonly totals: CircuitDailyTotal[]) {}

  public points(): Point[] {
    return this.totals.map((item) => {
      return new Point('circuit_daily_total')
        .timestamp(item.date)
        .tag('detail-section', item.name)
        .floatField('value', item.value);
    });
  }
}
