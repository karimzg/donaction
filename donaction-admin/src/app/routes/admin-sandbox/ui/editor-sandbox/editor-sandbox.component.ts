import { Component, inject, OnInit } from '@angular/core';
import { Button } from "primeng/button";
import { CardModule } from "primeng/card";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { EditorComponent } from "@shared/components/form/editor/editor.component";
import { SharedService } from "@shared/data-access/repositories/shared.service";
import { TransformationService } from "@shared/services/data-transformation.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-editor-sandbox',
  imports: [
    Button,
    CardModule,
    ReactiveFormsModule,
    EditorComponent,
  ],
  templateUrl: './editor-sandbox.component.html',
  styleUrl: './editor-sandbox.component.scss'
})
export class EditorSandboxComponent implements OnInit {
  private readonly sharedService = inject(SharedService);
  private readonly transformationService = inject(TransformationService);

  editorControl = new FormControl({value: '', disabled: false});
  form = new FormGroup({
    editorContent: this.editorControl,
  });

  ngOnInit(): void {
    this.getKlubrDetails();
  }

  getKlubrDetails() {
    this.sharedService.getKlubrHouseDetails()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data: any) => {
          console.log('API Description:', data?.description);
          if (data?.description) {
            const transformedData = this.transformationService.transformDataToEditorFormat(data.description);
            this.form.controls['editorContent'].setValue(transformedData);
            console.log(transformedData);
          } else {
            console.warn('No description found in the data');
          }
        },
        error: (error: any) => {
          console.error('Error fetching klubr details', error);
        }
      });
  }


  saveEditorContent() {
    console.log(this.form.value.editorContent)
    const klubrHouseDetails = this.transformationService.transformEditorToApiFormat(this.form.value.editorContent);
    console.log('formatted', klubrHouseDetails);
    this.sharedService.updateKlubrHouseDetails({data: {description: klubrHouseDetails}})
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response: any) => {
          console.log('Successfully updated:', response);
        },
        error: (err: any) => {
          console.error('Error updating klubr details', err);
        }
      });
  }

}
