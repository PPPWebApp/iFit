// Angular
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Rxjs
import { Subscription } from 'rxjs/Subscription';

// Ionic
import {
  AlertController,
  IonicPage,
  NavController,
  Popover,
  PopoverController
} from 'ionic-angular';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

// Third-party
import * as moment from 'moment';

// Models
import { Sleep } from '../../models';

// Providers
import { SleepProvider } from '../../providers';

@IonicPage({
  name: 'sleep',
  segment: ':id'
})
@Component({
  templateUrl: 'sleep.html'
})
export class SleepPage {
  private _authId: string;
  private _authSubscription: Subscription;
  private _sleepSubscription: Subscription;
  private _sleepFormSubscription: Subscription;
  public bedTime: AbstractControl;
  public duration: AbstractControl;
  public noElectronics: AbstractControl;
  public noStimulants: AbstractControl;
  public relaxation: AbstractControl;
  public sleep: Sleep = new Sleep();
  public sleepForm: FormGroup;
  constructor(
    private _afAuth: AngularFireAuth,
    private _alertCtrl: AlertController,
    private _formBuilder: FormBuilder,
    private _navCtrl: NavController,
    private _popoverCtrl: PopoverController,
    private _sleepPvd: SleepProvider
  ) {
    this.sleepForm = this._formBuilder.group({
      bedTime: [moment().format('HH:mm'), Validators.required],
      duration: [0, Validators.required],
      noElectronics: [false, Validators.required],
      noStimulants: [false, Validators.required],
      relaxation: [false, Validators.required]
    });
    this.bedTime = this.sleepForm.get('bedTime');
    this.duration = this.sleepForm.get('duration');
    this.noElectronics = this.sleepForm.get('noElectronics');
    this.noStimulants = this.sleepForm.get('noStimulants');
    this.relaxation = this.sleepForm.get('relaxation');
  }

  public showSettings(event: Popover): void {
    const popover: Popover = this._popoverCtrl.create('settings');
    popover.present({
      ev: event
    });
  }

  ionViewCanEnter(): void {
    this._authSubscription = this._afAuth.authState.subscribe((auth: firebase.User) => {
      if (!auth) {
        this._navCtrl.setRoot('registration', {
          history: 'sleep'
        });
      };
    })
  }

  ionViewWillEnter(): void {
    this._authSubscription = this._afAuth.authState.subscribe((auth: firebase.User) => {
      if (!!auth) {
        this._authId = auth.uid;
        this._sleepSubscription = this._sleepPvd.getSleep$(this._authId).subscribe(
          (sleep: Sleep) => {
            this.sleep = Object.assign({}, sleep['$value'] === null ? this.sleep : sleep);
            this.sleepForm.controls['bedTime'].patchValue(this.sleep.bedTime);
            this.sleepForm.controls['duration'].patchValue(this.sleep.duration);
            this.sleepForm.controls['noElectronics'].patchValue(this.sleep.combos.noElectronics);
            this.sleepForm.controls['noStimulants'].patchValue(this.sleep.combos.noStimulants);
            this.sleepForm.controls['relaxation'].patchValue(this.sleep.combos.relaxation);
          },
          (err: firebase.FirebaseError) => {
            this._alertCtrl.create({
              title: 'Uhh ohh...',
              subTitle: 'Something went wrong',
              message: err.message,
              buttons: ['OK']
            }).present();
          }
        );
      }
    });
    this._sleepFormSubscription = this.sleepForm.valueChanges.subscribe(
      (changes: {
        bedTime: string;
        duration: number;
        noElectronics: boolean;
        noStimulants: boolean;
        relaxation: boolean;
      }
      ) => {
        if (this.sleepForm.valid) {
          this.sleep = Object.assign(this.sleep, {
            bedTime: changes.bedTime,
            combos: {
              noElectronics: changes.noElectronics,
              noStimulants: changes.noStimulants,
              relaxation: changes.relaxation
            },
            duration: changes.duration
          });
          this._sleepPvd.saveSleep(this._authId, this.sleep)
          .then(() => console.log('Sleep saved successfully!'))
          .catch((err: firebase.FirebaseError) => console.error(`Error saving sleep: ${err.message}`));
        }
      },
      (err: Error) => console.error(`Error fetching form changes: ${err}`)
    );
  }

  ionViewWillLeave(): void {
    this._authSubscription && this._authSubscription.unsubscribe();
    this._sleepSubscription && this._sleepSubscription.unsubscribe();
    this._sleepFormSubscription && this._sleepFormSubscription.unsubscribe();
  }
}
