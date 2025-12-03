// error-handling.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AbstractControlWarn } from "../utils/validators/warning/warning.validator";

@Injectable({providedIn: 'root'})
export class FormErrorHandlingService {

  constructor() {
  }

  getErrorMessage(control: AbstractControl): string | null {
    if (control.errors) {
      return this.getMsg(control.errors);
    }
    return null;
  }

  getWarningMessage(control: AbstractControlWarn): string | null {
    if (control.warnings) {
      return this.getMsg(control.warnings);
    }
    return null;
  }

  getMsg(controlMsg: ValidationErrors): string | null {
    if (controlMsg['required']) {
      return 'Ce champ est obligatoire';
    } else if (controlMsg['minlength']) {
      return `La longueur minimale doit être de ${controlMsg['minlength'].requiredLength} caractères`;
    } else if (controlMsg['maxlength']) {
      return `La longueur maximale ne doit pas excéder ${controlMsg['maxlength'].requiredLength} caractères`;
    } else if (controlMsg['email']) {
      return 'Veuillez entrer une adresse email valide';
    } else if (controlMsg['mismatch']) {
      return 'Les mots de passe ne correspondent pas';
    } else if (controlMsg['sameAsOld']) {
      return 'Le nouveau mot de passe doit être différent du mot de passe actuel';
    } else if (controlMsg['dateAtLeastTomorrow']) {
      return 'Le date doit être supérieure à la date actuelle';
    } else if (controlMsg['min']) {
      return `Le valeur doit être supérieure à ${controlMsg['max'].min}`;
    } else if (controlMsg['max']) {
      return `Le valeur doit être inférieure à ${controlMsg['max'].max}`;
    } else if (controlMsg['minHtmlLength']) {
      return `Le texte doit contenir au minimum ${controlMsg['minHtmlLength'].minLength} caractères`;
    } else if (controlMsg['maxHtmlLength']) {
      return `Le texte doit contenir au maximum ${controlMsg['maxHtmlLength'].maxLength} caractères`;
    } else if (controlMsg['invalidHexColor']) {
      return `La couleur doit être au format hexadécimal`;
    } else if (controlMsg['googlePlaceFormat']) {
      return `Veuillez sélectionner une adresse dans la liste`;
    } else if (controlMsg['pattern']) {
      return `Veuillez saisir au bon format`;
    } else if (controlMsg['website']) {
      return `Veuillez saisir une adresse web valide (commençant par http:// ou https://)`;
    } else if (controlMsg['wrongPassword']) {
      return `Le mot de passe actuel est incorrect`;
    } else if (controlMsg['passwordStrength']) {
      return `Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial`;
    }
    return null;
  }
}
