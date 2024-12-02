import {ApplicationConfig, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {icons} from './icons-provider';
import {provideNzIcons} from 'ng-zorro-antd/icon';
import {vi_VN, provideNzI18n, NZ_DATE_LOCALE} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgxSpinnerModule} from 'ngx-spinner';
import {authInterceptor} from './core/auth.interceptor';
import {vi} from "date-fns/locale"
// import vi from "@angular/common/locales/vi"

// registerLocaleData(viVN);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    {provide: NZ_DATE_LOCALE, useValue: vi},
    provideNzIcons(icons),
    provideNzI18n(vi_VN),
    importProvidersFrom(
      FormsModule,
      NzModalModule,
      NgxSpinnerModule.forRoot({type: 'ball-scale-multiple'}),
      TranslateModule.forRoot({
        defaultLanguage: 'vi',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
