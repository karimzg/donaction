import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from "primeng/card";
import { htmlNbCars } from "@shared/utils/helpers/html-helpers";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxEditorModule,
    ButtonModule,
    RippleModule,
    CardModule,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ng-invalid]': 'control.invalid',
    '[class.ng-touched]': '!control.untouched',
    '[class.ng-dirty]': 'control.dirty',
  }
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  editor!: Editor;
  toolbar: Toolbar = [
    ['undo', 'redo'],
    [{heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']}],
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    // ['text_color', 'background_color'],
  ];

  @Input() control!: FormControl;
  @Input() placeholder: string = 'Écrivez quelque chose...';
  @Input() minChars = 0;
  @Input() maxChars = 600;
  @Input() name = 'editor';
  public nbCars: WritableSignal<number | undefined> = signal(undefined);
  public exceedLimit: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.control.valueChanges.subscribe((value: string) => {
      this.nbCars.set(htmlNbCars(value));
      this.exceedLimit.set((this.nbCars()! >= this.maxChars) || (this.nbCars()! < this.minChars));
    });
    this.editor = new Editor();
  }

  ngAfterViewInit() {
    document.querySelectorAll('.NgxEditor__MenuBar > *, .NgxEditor__MenuBar button').forEach(element => {
      element.setAttribute('tabindex', '-1');
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
