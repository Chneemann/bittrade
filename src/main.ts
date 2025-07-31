// Suppresses the ngx-charts warning because of ‘strokeDashoffset’.
const originalWarn = console.warn;
console.warn = function (...args: any[]) {
  const warningMessage = args[0];
  if (
    typeof warningMessage === 'string' &&
    /strokeDashoffset/i.test(warningMessage)
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
