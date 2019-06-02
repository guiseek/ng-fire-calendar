import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Schedule } from './models/schedule';
import { Observable } from 'rxjs';
import { firestore } from 'firebase/app';

@Injectable()
export class ScheduleService {
  private _path: string = 'schedule'
  constructor(
    private afs: AngularFirestore
  ) { }
  async create(data: Schedule): Promise<string> {
    return await this.afs.collection(this._path).add(data)
      .then((ref) => {
        console.log(ref)
        return Promise.resolve(ref.id)
      })
  }
  update({id, ...data}: Schedule) {
    // if (data.rrule && data.rrule.byweekday) {
    //   let { byweekday, ...event } = data
    //   data = {
    //     ...event,
    //     byweekday: byweekday.weekday
    //   }
    // }
    // data = JSON.parse(data)
    return this.afs.collection(this._path).doc(id)
      .update(data)
  }
  addExDate(id: string, date: Date) {
    const ref = this.afs.collection(this._path).doc(id)
    return ref.update({
      exdates: firestore.FieldValue.arrayUnion(date)
    })
  }
  findAll(): Observable<Schedule[]> {
    return this.afs.collection<Schedule>(this._path)
      .stateChanges().pipe(
        map(changes => {
          return changes.map(c => Object.assign({}, c.payload.doc.data(), { id: c.payload.doc.id }));
        }),
        // take(1)
      )
  }
  remove(id: string) {
    return this.afs.collection(this._path).doc(id).delete()
  }
}
