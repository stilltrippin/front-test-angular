import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormArray, FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import {HealthcareService} from "./healthcare.service";
import {Illness} from "./illness";



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'projecto';
  formGroup: FormGroup;
  illnessList: Illness[];
  addedList: Illness [];


  constructor(private fb: FormBuilder, private healthCareService: HealthcareService) {
  }

  ngOnInit(): void {

    this.formGroup = this.fb.group({
      date: ['', [Validators.required]],
      illnesses: this.fb.array([]),
      output: ['']
    });
    this.getIllnessList();
    for (let i = 0; i < 2; i++) {
      this.addIllness();
    }

  }

  get illnesses() {
    return this.formGroup.controls["illnesses"] as FormArray;
  }


  addIllness() {
    const illnessForm: FormGroup = this.fb.group({
      code: [''],
      name: ['', Validators.required],
      comment: [''],
    });

    this.illnesses.push(illnessForm);
  }

  resetDate() {
    if (new Date(this.formGroup.get('date').getRawValue()) < new Date())
      this.formGroup.get('date').setValue(new Date().toISOString().split('T')[0]);
  }


  getIllnessValue(control: AbstractControl) {
    return this.illnessList.filter(x => x.name === control.get('name').getRawValue())[0];
  }

  getIllnessList() {
    this.healthCareService.getIllnessList().subscribe({
      next: (value: Illness[]) => {
        this.illnessList = value;
      }
    })
  }
  generateGuid(): string {
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return guid;
  }
  createJSON() {
    if(this.formGroup.get('date').getRawValue() == "") return;
    let dateInfo = {
      date: new Date(this.formGroup.get('date').getRawValue()).toISOString()
    };
    let conditions = [];
    this.illnesses.controls.forEach(control => {
      if(control.getRawValue().name != "") {
      conditions.push(
        {
          id: this.generateGuid(),
          context: {
            identifier: {
              type: {
                coding: [
                  {
                    system: "eHealth/resources",
                    code: "encounter"
                  }
                ]
              },
              value: this.getIllnessValue(control).id
            }
          },
          code: {
            coding: [
              {
                system: "eHealth/ICPC2/condition_codes",
                code: this.getIllnessValue(control).code
              }
            ]
          }, notes: control.get('comment').getRawValue(),
          onset_date: dateInfo.date

        });
      }
    })
    let outputVal = (conditions.length == 0) ? {encounter: dateInfo} : {
      encounter: dateInfo,
      conditions: conditions
    }

      this.formGroup.get('output').setValue(JSON.stringify(outputVal, null, 2));

    }



}

