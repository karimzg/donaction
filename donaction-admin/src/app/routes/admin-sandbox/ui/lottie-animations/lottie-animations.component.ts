import { ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { AnimationOptions, LottieComponent } from "ngx-lottie";
import { AnimationItem } from "lottie-web";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from "primeng/autocomplete";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-lottie-animations',
    templateUrl: './lottie-animations.component.html',
    styleUrl: './lottie-animations.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LottieComponent,
        FormsModule,
        AutoCompleteModule
    ]
})
export class LottieAnimationsComponent implements OnInit {
  options: WritableSignal<AnimationOptions | null> = signal<AnimationOptions | null>(null);

  animationsList: Array<any> = [
    {label: '403', value: 'assets/animations/403.json'},
    {label: '404', value: 'assets/animations/404.json'},
    {label: 'Baskteball', value: 'assets/animations/basketball.json'},
    {label: 'Coming soon', value: 'assets/animations/coming-soon.json'},
    {label: 'Coming soon 2', value: 'assets/animations/coming-soon-2.json'},
    {label: 'Empty page', value: 'assets/animations/empty-page.json'},
    {label: 'Loading', value: 'assets/animations/loading.json'},
    {label: 'Loading 2', value: 'assets/animations/loading-2.json'},
    {label: 'No sponsors', value: 'assets/animations/no-sponsors.json'},
    {label: 'No donations', value: 'assets/animations/no-donations.json'},
    {label: 'No results', value: 'assets/animations/no-results.json'},
    {label: 'No projects', value: 'assets/animations/no-projects.json'},
    {label: 'Notifications', value: 'assets/animations/notification.json'},
  ];
  selectedAnimation: any | undefined;
  filteredAnimations: Array<any> | undefined;

  constructor() {
  }

  ngOnInit(): void {
    this.selectedAnimation = this.animationsList[0];
    this.updateAnimation(this.selectedAnimation);
  }

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

  filterAnimation(event: AutoCompleteCompleteEvent) {
    let query = event.query;

    this.filteredAnimations = this.animationsList.filter((animation) => {
      return animation.label.toLowerCase().indexOf(query.toLowerCase()) == 0;
    });
  }

  updateAnimation(animationSelected: any): void {
    console.log(animationSelected.value);
    this.options.set({
      ...this.options(), // In case you have other properties that you want to copy
      path: animationSelected.value,
    });
  }
}
