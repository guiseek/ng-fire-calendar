import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { BottomOption } from './bottom-option';

@Component({
  selector: 'app-bottom-options',
  templateUrl: './bottom-options.component.html',
  styleUrls: ['./bottom-options.component.scss']
})
export class BottomOptionsComponent {
  constructor(
    public bottomSheetRef: MatBottomSheetRef<BottomOptionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public options: BottomOption[]
  ) { }
}
