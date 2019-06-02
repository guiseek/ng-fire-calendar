import RRule from 'rrule';

export const datetime = {
  weekdays: [
    { value: RRule.SU, viewValue: 'D' },
    { value: RRule.MO, viewValue: 'S' },
    { value: RRule.TU, viewValue: 'T' },
    { value: RRule.WE, viewValue: 'Q' },
    { value: RRule.TH, viewValue: 'Q' },
    { value: RRule.FR, viewValue: 'S' },
    { value: RRule.SA, viewValue: 'S' }
  ]
}