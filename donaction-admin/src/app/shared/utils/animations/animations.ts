import { animate, keyframes, state, style, transition, trigger } from "@angular/animations";

export const flipAnimation = trigger('flip', [
  state('default', style({transform: 'rotateX(0)'})),
  transition(':enter', [
    animate('0.3s', keyframes([
      style({transform: 'rotateX(90deg)', offset: 0}),
      style({transform: 'rotateX(0)', offset: 1.0})
    ]))
  ]),
  transition(':leave', [
    animate('0.3s', keyframes([
      style({transform: 'rotateX(0)', offset: 0}),
      style({transform: 'rotateX(90deg)', offset: 1.0})
    ]))
  ])
]);

export const fadeAnimation = trigger('fade', [
  state('void', style({opacity: 0})),
  transition(':enter', [
    animate(300)
  ])
]);

const fadeInOutTimeout = 750;
export const fadeInOut = trigger('fadeInOut', [
  transition('void => *', [style({opacity: '0', transform: 'translateX(-10%)'})]),
  transition('* => void', [animate(fadeInOutTimeout, style({opacity: '0'}))]),
  transition('* => *', [
    style({opacity: '0', transform: 'translateX(-10%)'}),
    animate(`0.${fadeInOutTimeout}s cubic-bezier(.8, -0.6, 0.2, 1.5)`, style({
      opacity: '1',
      transform: 'translateX(0%)'
    })),
  ]),
]);
