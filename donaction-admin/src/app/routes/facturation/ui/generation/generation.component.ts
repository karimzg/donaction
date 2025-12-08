import { Component, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from "@angular/common";
import { PaginatorModule } from "primeng/paginator";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { CheckboxModule } from "primeng/checkbox";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Button } from "primeng/button";
import { InvoiceService } from "@shared/services/entities/invoice.service";
import { GeneratedInvoice, GeneratedInvoiceErrors, InvoiceGenerate } from "@shared/utils/models/invoice";
import { TableModule } from "primeng/table";
import { ToastService } from "@shared/services/misc/toast.service";
import { Select } from "primeng/select";

@Component({
  selector: 'app-generation',
  imports: [
    Select,
    PaginatorModule,
    DropdownKlubFilterComponent,
    CheckboxModule,
    ReactiveFormsModule,
    Button,
    TableModule,
    CurrencyPipe
  ],
  templateUrl: './generation.component.html',
  styleUrl: './generation.component.scss'
})
export class GenerationComponent {
  private readonly datePipe = new DatePipe('fr-FR');
  private toastService = inject(ToastService);
  private invoiceService = inject(InvoiceService);

  public klubrUuid: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  public generationForm: FormGroup = new FormGroup({});

  public generatedInvoices: WritableSignal<Array<GeneratedInvoice>> = signal([]);
  public generatedInvoicesErrors: WritableSignal<Array<GeneratedInvoiceErrors>> = signal([]);
  public isLoading: WritableSignal<boolean> = signal(false);


  private filterKlubrField = viewChild<DropdownKlubFilterComponent>('klubrDropdown');

  constructor() {
    this.init_form();
  }

  // FORM
  private init_form(): void {
    this.generationForm = new FormGroup({
      billingPeriodSmall: new FormControl({value: undefined, disabled: false},
        Validators.required),
      pdf: new FormControl({value: false, disabled: false}),
      mail: new FormControl({value: false, disabled: false}),
    });
  }

  public resetForm(): void {
    this.generationForm.patchValue({
      billingPeriodSmall: undefined,
      pdf: false,
      mail: false,
    });
    this.klubrUuid.set(undefined);
    this.filterKlubrField()?.clear();
    this.generationForm.markAsPristine();
  }

  public generateInvoices(form: InvoiceGenerate) {
    this.isLoading.set(true);
    this.invoiceService.generateInvoices(form, this.klubrUuid()).subscribe({
      next: (response) => {
        const generatedInvoices = response.clubInvoices.map((invoice) => {
          const invoiceNumber = invoice.split(' ')[1];
          const klubName = invoice.split('pour ')[1].split(' :')[0];
          const nbDonationsKlub = parseInt(invoice.split(': ')[2].split(' |')[0]);
          const nbDonationsProjects = parseInt(invoice.split(': ')[3].split(' |')[0]);
          const creditTotalAmount = parseFloat(invoice.split(': ')[4].split(' |')[0].replace(',', '.'));
          const amountExcludingTax = parseFloat(invoice.split(': ')[5].split(' |')[0].replace(',', '.'));
          return {
            klubr: klubName,
            invoiceNumber,
            creditTotalAmount,
            amountExcludingTax,
            nbDonationsKlub,
            nbDonationsProjects,
            billingPeriodSmall: response.period,
          } as GeneratedInvoice;
        });
        this.generatedInvoices.set(generatedInvoices);
        const generatedInvoicesErrors = response.clubInvoicesErrors.map((error) => {
          const klubr = error.match(/Erreur pour (.*) \(/)![1];
          error = error.match(/\(([^)]+)\)/)![1];
          return {
            klubr,
            error,
          } as GeneratedInvoiceErrors;
        });
        this.generatedInvoicesErrors.set(generatedInvoicesErrors);
        this.toastService.showSuccessToast('Factures générées', 'Les factures ont été générées avec succès');

      },
      error: (error) => {
        console.error('error', error);
        this.toastService.showErrorToast('Erreur lors de la génération des factures', 'Une erreur est survenue lors de la génération des factures');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Date
  public period: WritableSignal<{
    month: string,
    year: string,
    currentMonth?: boolean
  } | undefined> = signal(this.getCurrentMonth());
  public availableMonths: WritableSignal<Array<{
    month: string,
    year: string,
    currentMonth?: boolean
  }>> = signal(this.generateAvailableMonths());

  getCurrentMonth() {
    const currentMonth = (new Date()).getMonth() + 1;
    const currentYear = (new Date()).getFullYear();
    return {
      month: (currentMonth).toString().padStart(2, '0'),
      year: currentYear.toString(),
      currentMonth: true,
    };
  }

  generateAvailableMonths() {
    const currentMonth = (new Date()).getMonth() + 1;
    const currentYear = (new Date()).getFullYear();
    const availableMonths = [];
    for (let i = 0; i < 12; i++) {
      const dateTmp = new Date(currentYear, currentMonth - i - 1, 1);
      const transformedDate = this.datePipe.transform(dateTmp, 'MMMM yyyy')!;
      const label = transformedDate.charAt(0).toUpperCase() + transformedDate.slice(1);
      availableMonths.push({
        month: (dateTmp.getMonth() + 1).toString().padStart(2, '0'),
        year: dateTmp.getFullYear().toString(),
        label,
        currentMonth: i === 0,
      });
    }
    return availableMonths;
  }

  changePeriod(period?: { month: string, year: string, label: string }) {
    console.log('period', period);
    this.period.set(period);
  }

}
