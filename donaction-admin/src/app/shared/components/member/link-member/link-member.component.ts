import { Component, effect, inject, Input, OnDestroy, signal, Signal, ViewChild, WritableSignal, } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { NgOtpInputComponent, NgOtpInputModule } from 'ng-otp-input';
import { InputOtpChangeEvent, InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';
import { SharedFacade } from '@shared/data-access/+state/shared.facade';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { setSeverity } from "@shared/utils/helpers/role-severity";
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";
import {
  defaultKlubMemberFunctions,
  KlubrMembre,
  KlubrMembreRole,
  UserDetail
} from "@shared/utils/models/user-details";
import { filter, pairwise } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RoleTagComponent } from "../../atoms/role-tag/role-tag.component";
import { LottieComponent } from "ngx-lottie";
import { ErrorDisplayComponent } from "../../form/error-display/error-display.component";
import { SharedService } from "@shared/data-access/repositories/shared.service";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { ToastService } from "@shared/services/misc/toast.service";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { Select } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-link-member',
  imports: [
    CommonModule,
    NgOtpInputModule,
    InputOtpModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ChipModule,
    TagModule,
    AvatarModule,
    ToastModule,
    RouterLink,
    RoleTagComponent,
    LottieComponent,
    ErrorDisplayComponent,
    MediaPipe,
    Select,
    InputTextModule,
  ],
  templateUrl: './link-member.component.html',
  styleUrls: ['./link-member.component.scss'],
  animations: [fadeAnimation]
})
export class LinkMemberComponent implements OnDestroy {
  private sharedFacade = inject(SharedFacade);
  private sharedService = inject(SharedService);
  private authFacade = inject(AuthFacade);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private analyticsService = inject(AnalyticsService);

  public meDetails: Signal<UserDetail | undefined | null> = this.authFacade.me;
  public memberRole: WritableSignal<KlubrMembreRole> = signal('KlubMember');
  public isKlubCode: WritableSignal<boolean> = signal(false);
  public isSubmitted: WritableSignal<boolean> = signal(false);

  linkCode = signal('');
  lastProcessedCode = signal('');
  showBtn = signal(false);
  hasError = signal(false);
  members: WritableSignal<Array<any>> = signal([]);
  klubs: WritableSignal<Array<any>> = signal([]);

  private _code: WritableSignal<string | undefined> = signal(undefined);
  @Input() set code(value: string | undefined) {
    this._code.set(value);
  }

  @ViewChild(NgOtpInputComponent, {static: false}) ngOtpInput!: NgOtpInputComponent;


  public profileForm: FormGroup = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    fonction: new FormControl('', [Validators.required]),
  });

  constructor() {
    effect(() => {
      if (this._code()) {
        const code: string | undefined = this._code();
        if (code && (this.isMemberCodeValid(code) || this.isKlubCodeValid(code))) {
          this.handlelinkCodeChange(code);
        } else {
          this.toastService.showErrorToast('Erreur', `Le code ${code} ne contient pas le nombre de caractères attendu`);
        }
      }
    });
    effect(() => {
      let members = this.sharedFacade.filteredMembers();
      const filteredMembersIsLoaded = this.sharedFacade.filteredMembersIsLoaded();
      if (members && members?.length === 0 && filteredMembersIsLoaded) {
        this.showBtn.set(true);
        this.hasError.set(true);
        this.linkCode.set('');
      } else if (members?.length) {
        this.showBtn.set(false);
        members = members.map((member: any) => {
          return {
            ...member,
            severity: setSeverity(member.role),
          };
        });
        this.members.set(members);
      }
    });
    effect(() => {
      let klubs = this.sharedFacade.filteredKlubs();
      const filteredKlubsIsLoaded = this.sharedFacade.filteredKlubsIsLoaded();
      if (klubs && klubs?.length === 0 && filteredKlubsIsLoaded) {
        this.showBtn.set(true);
        this.hasError.set(true);
        this.linkCode.set('');
      } else if (klubs?.length) {
        this.showBtn.set(false);
        klubs = klubs.map((klub: any) => {
          return {
            ...klub,
            severity: 'success',
          };
        });
        this.klubs.set(klubs);
      }
    });

    this.authFacade.me$.pipe(
      takeUntilDestroyed(),
      pairwise(), // Compare the current and previous values
      filter(([prevMe, currMe]) =>
        !!prevMe
        && prevMe.klubr_membres?.length === 0
        && !!currMe
        && currMe.klubr_membres?.length > 0
      ),
    ).subscribe(() => this.router.navigate(['/']));
  }

  private isMemberCodeValid(code: string): boolean {
    return code.length === 8 && !code.startsWith('KC') && !code.startsWith('LC');
  }

  private isKlubCodeValid(code: string): boolean {
    const isKlubCode = code.length === 8 && (code.startsWith('KC') || code.startsWith('LC'));
    this.isKlubCode.set(isKlubCode);
    this.memberRole.set(code.startsWith('LC') ? 'KlubMemberLeader' : 'KlubMember');
    return isKlubCode;
  }

  ngOnDestroy() {
    this.goBack();
  }

  handlelinkCodeChange(event: InputOtpChangeEvent | string): void {
    const code = typeof event === 'string' ? event : event.value;
    if ((this.isMemberCodeValid(code) || this.isKlubCodeValid(code)) && this.lastProcessedCode() !== code) {
      this.linkCode.set(code);
      this.isKlubCodeValid(code) ? this.filterKlubsLinkedToThisCode(code, this.memberRole()) : this.filterMembersLinkedToThisCode(code);
      this.lastProcessedCode.set(code);
    }
  }

  filterMembersLinkedToThisCode(code: string): void {
    this.sharedFacade.filterMembersByCode(code);
  }

  filterKlubsLinkedToThisCode(code: string, role: KlubrMembreRole): void {
    this.sharedFacade.filterKlubsByCode(code, role);
  }

  linkUser(item: any): void {
    if (this.isKlubCode()) {
      // Check form validity
      if (this.profileForm.invalid) {
        this.toastService.showErrorToast('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return;
      }
      const profileToCreate: Partial<KlubrMembre> = this.profileForm.value;
      profileToCreate.slug = 'null';
      profileToCreate.klubr = item.uuid;
      profileToCreate.role = this.memberRole();
      const codeData: string = `${this.isKlubCode() ? 'codeInvitationKlub' : 'codeInvitationMember'}=` + this.linkCode();
      this.isSubmitted.set(true);
      this.sharedService.createProfile(profileToCreate, codeData).pipe().subscribe({
        next: (result: any) => {
          const profileCreated: KlubrMembre = result.data;
          if (profileCreated.code && this.isMemberCodeValid(profileCreated.code)) {
            this.sharedFacade.linkMembersToUser(profileCreated.code);
          }
          this.isSubmitted.set(false);
          this.analyticsService.trackEvent('LinkProfile', {
            customProps: {
              Action: `MAJ LinkProfile by KlubCode: ${profileCreated.role} - ${this.klubs()[0].denomination} (${this.meDetails()?.uuid})`,
            }
          });
        },
        error: (error: any) => {
          console.log('error', error);
          this.isSubmitted.set(false);
          this.toastService.showErrorToast('Erreur', 'Une erreur est survenue lors de la création du profil');
        }
      });

      return;
    }
    this.sharedFacade.linkMembersToUser(this.linkCode());
    this.analyticsService.trackEvent('LinkProfile', {
      customProps: {
        Action: `MAJ LinkProfile by ProfileCode:  > ${this.members() ? `${this.members()[0].role} - ${this.members()[0].klubr?.denomination}` : 'N/A'} (${this.meDetails()?.uuid})`,
      }
    });
  }

  clearOptInput(): void {
    this.ngOtpInput.setValue(null);
    this.lastProcessedCode.set('');
    this.hasError.set(false);
  }

  goBack(): void {
    this.linkCode.set('');
    this.lastProcessedCode.set('');
    this.members.set([]);
    this.klubs.set([]);
    this.isKlubCode.set(false);
    this.code = undefined;
    this.sharedFacade.emptyFilterMembers();
    this.sharedFacade.emptyFilterKlubs();
  }

  protected readonly defaultKlubMemberFunctions = defaultKlubMemberFunctions;
}
