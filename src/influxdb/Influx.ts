import { InfluxDB, WriteApi, Point } from '@influxdata/influxdb-client';

export interface Pointer {
  points(): Point[];
}

export class Influx {
  private readonly writeClient: WriteApi;
  constructor(host: string, token: string, orgName: string, bucketName: string, useHTTPS: boolean) {
    const url = `${useHTTPS ? 'https' : 'http'}://${host}`;

    const client = new InfluxDB({ url, token });
    this.writeClient = client.getWriteApi(orgName, bucketName, 'ns');
  }

  public write(pointers: Pointer[]) {
    pointers.forEach((pointer) => {
      this.writeClient.writePoints(pointer.points());
    });
  }

  public close() {
    return this.writeClient.close();
  }
}
