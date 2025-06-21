export class Study {
  public id: string;
  public title: string;
  public time: number;

  constructor(id: string, title: string, time: number) {
    this.id = id;
    this.title = title;
    this.time = time;
  }
}