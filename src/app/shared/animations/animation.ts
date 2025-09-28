import { animate, keyframes, style, transition, trigger } from "@angular/animations";

export const animationComponent = [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('500ms', style({ opacity: 0, transform: 'translateY(15px)' })),
    ]),
  ]),

  trigger('fadeInOutSale', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('500ms', style({ opacity: 0, transform: 'translateY(15px)' })),
    ]),
  ]),
]

export const animationLogin = [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-500px)' }),
      animate('500ms ease-out', keyframes([
        style({ opacity: 1, transform: 'translateY(220px)' }),
        style({ transform: 'translateY(-10px)' }),
        style({ transform: 'translateY(0px)' }),
      ])),
    ]),
    transition(':leave', [
      style({ opacity: 1, transform: 'translateY(0px)' }),
      animate('500ms ease-in', keyframes([
        style({ transform: 'translateY(-30px)', offset: 0.6 }),
        style({ opacity: 0, transform: 'translateY(500px)', offset: 1 }),
      ])),
    ]),
  ])]

export const animationNotify = [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-500px)' }),
      animate('500ms ease-out', keyframes([
        style({ opacity: 1, transform: 'translateX(220px)' }),
        style({ transform: 'translateX(-10px)' }),
        style({ transform: 'translateX(0px)' }),
      ])),
    ]),
    transition(':leave', [
      style({ opacity: 1, transform: 'translateX(0px)' }),
      animate('500ms ease-in', keyframes([
        style({ transform: 'translateX(-30px)', offset: 0.6 }),
        style({ opacity: 0, transform: 'translateX(500px)', offset: 1 }),
      ])),
    ]),
  ])
]

export const animationAparecerDes = [
  trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('500ms', style({ opacity: 0, transform: 'translateY(15px)' })),
    ]),
  ])
]