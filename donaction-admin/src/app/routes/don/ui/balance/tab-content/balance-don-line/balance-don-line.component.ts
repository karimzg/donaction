import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { ITabActions, ITabContent, TabContentContext } from "@shared/utils/models/tabContent";
import { NgClass, NgOptimizedImage, NgTemplateOutlet } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AvatarModule } from "primeng/avatar";
import { PermissionsService } from "@shared/services/permissions.service";
import { TooltipModule } from "primeng/tooltip";
import { Invoice } from "@shared/utils/models/invoice";
import { InvoiceService } from "@shared/services/entities/invoice.service";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { TagModule } from "primeng/tag";
import { DeviceService } from "@shared/services/device.service";
import { Drawer } from "primeng/drawer";

@Component({
  selector: 'app-balance-don-line',
  imports: [
    NgOptimizedImage,
    NgClass,
    RouterModule,
    NgTemplateOutlet,
    AvatarModule,
    TagModule,
    TooltipModule,
    KlubInfosComponent,
    Drawer,
  ],
  templateUrl: './balance-don-line.component.html',
  styleUrl: './balance-don-line.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceDonLineComponent {
  public permissionsService = inject(PermissionsService);
  public invoiceService = inject(InvoiceService);
  protected deviceService = inject(DeviceService);

  selectedItem: WritableSignal<ITabContent | undefined> = signal<ITabContent | undefined>(undefined);
  content: InputSignal<ITabContent | undefined> = input<ITabContent | undefined>(undefined);
  context: InputSignal<TabContentContext> = input<TabContentContext>('CLUB');
  dataUpdated: InputSignal<number> = input<number>(0);
  public invoice: Signal<Invoice | undefined> = computed(() => this.content()?.contextObject?.invoice);

  public showActions: WritableSignal<boolean> = signal(false);
  onAction: OutputEmitterRef<{ action: ITabActions, event: ITabContent }> = output();

  downloadInvoice(invoice: Invoice) {
    if (invoice) {
      this.invoiceService.downloadInvoice(invoice.uuid, invoice.invoiceNumber);
    }
  }

  toggleActions(item?: ITabContent) {
    if (item) {
      console.log('item', item);
      this.selectedItem.update(() => item);
    }
    this.showActions.update((showActions) => !showActions);
  }

  updateSelectedItem(item: ITabContent) {
    this.selectedItem.update(() => item);
    console.log('selectedItem', this.selectedItem()!.contextDetail.links[0].onClick);
  }

  protected readonly screen = screen;
}
