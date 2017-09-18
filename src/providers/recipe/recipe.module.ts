import { NgModule } from '@angular/core';

import { IonicPageModule } from 'ionic-angular';

import { RecipeProvider } from './recipe';
import { FitnessProviderModule } from '../fitness/fitness.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(RecipeProvider),
  ],
  providers: [
    RecipeProvider,
    FitnessProviderModule
  ]
})
export class RecipeProviderModule {}