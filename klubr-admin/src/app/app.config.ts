import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideStore, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { LoginEffects } from './routes/auth/data-access/+state/auth.effects';
import { AUTH_FEATURE_KEY, reducer } from './routes/auth/data-access/+state/auth.reducer';
import { SHARED_FEATURE_KEY, sharedReducer } from '@shared/data-access/+state/shared.reducer';
import { SharedEffects } from '@shared/data-access/+state/shared.effects';
import { authInterceptor } from '@shared/utils/interceptors/auth.interceptor';
// import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { environment } from '@environments/environment';
import { MessageService, Translation } from 'primeng/api';
import { NgxEditorModule } from 'ngx-editor';
import { httpErrorsInterceptor } from "@shared/utils/interceptors/http-errors.interceptor";
import { provideLottieOptions } from "ngx-lottie";
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { registerLocaleData } from "@angular/common";
import localeFr from '@angular/common/locales/fr';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { providePrimeNG } from "primeng/config";
import { klubrPreset } from "@shared/utils/theme/theme.preset";
import { provideServiceWorker } from "@angular/service-worker";

registerLocaleData(localeFr, 'fr-FR');

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'EUR'
    },
    // {
    //   provide: 'SocialAuthServiceConfig',
    //   useValue: {
    //     autoLogin: false,
    //     providers: [
    //       {
    //         id: GoogleLoginProvider.PROVIDER_ID,
    //         provider: new GoogleLoginProvider(
    //           environment.googleClientId,
    //           {
    //             scopes: 'profile email https://www.googleapis.com/auth/userinfo.email'
    //             // You can add additional scopes if necessary
    //           }
    //         )
    //       },
    //
    //     ],
    //     onError: (err) => {
    //       console.error(err);
    //     }
    //   } as SocialAuthServiceConfig,
    // },
    MessageService,
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({scrollPositionRestoration: 'top'})),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorsInterceptor]), withJsonpSupport()),
    provideStore(),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        // preset: Lara,
        preset: klubrPreset,
        options: {
          prefix: 'p',
          darkModeSelector: false || 'none',
          // darkModeSelector: 'system',
          // cssLayer: true,
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, klubr, tailwind-utilities'
          },
          ripple: false,                      //toggles ripple on and off
          // inputStyle: 'outlined',             //default style for input elements
          // menuMode: 'static',                 //layout mode of the menu, valid values are "static" and "overlay"
          // colorScheme: 'light',               //color scheme of the template, valid values are "light" and "dark"
          // theme: 'lara-light-indigo',         //default component theme for PrimeNG
          scale: 14,                          //default scale for components
        },
      },
      translation: {
        close: "Fermer",
        prevText: "Précédent",
        nextText: "Suivant",
        currentText: "Aujourd'hui",
        today: "Aujourd'hui",
        clear: "Effacer",
        monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
          "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        monthNamesShort: ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
          "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
        dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
        dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
        weekHeader: "Sem.",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
      } as Translation
    }),
    importProvidersFrom(
      BrowserAnimationsModule,
      StoreModule.forRoot({}),
      StoreModule.forFeature(AUTH_FEATURE_KEY, reducer),
      StoreModule.forFeature(SHARED_FEATURE_KEY, sharedReducer),
      EffectsModule.forRoot([]),
      EffectsModule.forFeature([LoginEffects, SharedEffects]),
      RecaptchaV3Module,
      NgxEditorModule.forRoot({
        locals: {
          // menu
          bold: 'Gras',
          italic: 'Italique',
          code: 'Code',
          underline: 'Soulingné',
          strike: 'Barré',
          blockquote: 'Citation',
          bullet_list: 'Liste à puces',
          ordered_list: 'Liste ordonnée',
          heading: 'Titre',
          h1: 'Titre 1',
          h2: 'Titre 2',
          h3: 'Titre 3',
          h4: 'Titre 4',
          h5: 'Titre 5',
          h6: 'Titre 6',
          align_left: 'Aligner à gauche',
          align_center: 'Centrer',
          align_right: 'Aligner à droite',
          align_justify: 'Justifier',
          text_color: 'Couleur du texte',
          background_color: 'Couleur de fond',
          horizontal_rule: 'Ligne horizontale',
          format_clear: 'Effacer le formatage',
          insertLink: 'Insérer un lien',
          removeLink: 'Supprimer le lien',
          insertImage: 'Insérer une image',
          indent: 'Augmenter le retrait',
          outdent: 'Diminuer le retrait',
          superscript: 'Exposant',
          subscript: 'Indice',
          undo: 'Annuler',
          redo: 'Refaire',
          placeholder: 'Écrivez quelque chose...',
          url: 'URL',
          text: 'Texte',
          openInNewTab: 'Ouvrir dans un nouvel onglet',
          insert: 'Insérer',
          altText: 'Texte alternatif',
          title: 'Titre',
          remove: 'Supprimer',
          enterValidUrl: 'Entrez une URL valide',
        },
      }),
      MessageService,
    ),
    // Add serializable: true to serialize the state for showing cache Map in devtools
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode(), serialize: true}),
    {provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.ANGULAR_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY},
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.pwaEnabled,
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};

