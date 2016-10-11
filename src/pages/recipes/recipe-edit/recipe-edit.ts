import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams, ToastController } from 'ionic-angular';

// Models
import { Recipe } from '../../../models';

// Pages
import { IngredientSearch } from '../ingredient-search/ingredient-search';

// Providers
import { RecipeService } from '../../../providers';

const DIETARIES = [
  "Gluten-free",
  "High-fiber",
  "High-protein",
  "Low-carb",
  "Low-fat",
  "Mediteranean",
  "Vegetarian"
];

@Component({
  templateUrl: 'recipe-edit.html'
})
export class RecipeEdit implements OnInit {
  public checkedDietaries: string[];
  public recipe: Recipe;
  public recipeSteps: string[] = [];  // Required for a bug when trying to write in the input of a step

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private params: NavParams,
    private recipeSvc: RecipeService,
    private toastCtrl: ToastController
  ) { }

  public addStep(): void {
    this.recipe.steps.push('');
    this.recipeSteps.push('');
  }

  public changeQuantity(ingredient: any): void {
    let quantityAlert = this.alertCtrl.create({
      title: `${ingredient.name}`,
      message: "Enter quantity",
      inputs: [
        {
          name: 'quantity',
          placeholder: ingredient.hasOwnProperty('chef') ? 'Portions' : 'Grams',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Canceled');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if (ingredient.hasOwnProperty('chef')) {
              ingredient.amount = +data.quantity;
            } else {
              ingredient.quantity = +data.quantity;
            }
          }
        }
      ]
    });
    quantityAlert.present();
  }

  public createRecipe(): void {
    this.recipe.steps = [...this.recipeSteps];
    let notifToast = this.toastCtrl.create({
      message: 'Please complete the entire recipe!',
      showCloseButton: true,
      closeButtonText: 'Ok'
    });
    if (this.recipe.ingredients.length === 0) {
      notifToast.present();
    } else if (this.recipe.ingredients.length === 0) {
      notifToast.present();
    } else {
      this.recipe.nutrition = this.recipeSvc.calcRecipeNutrition(this.recipe);
      if(this.recipe.hasOwnProperty('$key')) {
        this.recipeSvc.updateRecipe(this.recipe);
      } else {
        this.recipeSvc.addRecipe(this.recipe);
      }
      this.navCtrl.pop();
    }
  }

  public removeDietary(index: number): void {
    this.checkedDietaries.splice(index, 1);
  }

  public removeIngredient(index: number): void {
    this.recipe.ingredients.splice(index, 1);
  }

  public removeStep(index: number): void {
    this.recipe.steps.splice(index, 1);
    this.recipeSteps.splice(index, 1);
  }

  public searchIngredient(): void {
    let ingredientsModal = this.modalCtrl.create(IngredientSearch, {
      ingredients: this.recipe.ingredients,
      noQuantity: false
    });
    ingredientsModal.onDidDismiss(ingredients => {
      if (ingredients) {
        this.recipe.ingredients = [...ingredients];
      }
    });
    ingredientsModal.present()
  }

  public selectDietaries(): void {
    let checkboxAlert = this.alertCtrl.create();
    checkboxAlert.setTitle('Which planets have you visited?')
    DIETARIES.forEach(item => {
      checkboxAlert.addInput({
        type: 'checkbox',
        label: `${item}`,
        value: `${item}`
      });
    })
    checkboxAlert.addButton('Cancel');
    checkboxAlert.addButton({
      text: 'Okay',
      handler: data => {
        if (data) {
          this.checkedDietaries = [...data];
        }
      }
    });
    checkboxAlert.present();
  }

  ngOnInit(): void {
    this.recipe = this.params.get("recipe");
    console.log(this.recipe);
  }

}
