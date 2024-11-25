import {inject, Injectable, Injector} from '@angular/core'
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http'
import {catchError, filter, finalize, map, Observable, throwError} from 'rxjs'
import {Router} from '@angular/router'
import {TranslateService} from '@ngx-translate/core'
import {STORAGE_KEYS} from '../shared/constants/system.const'
import {NgxSpinnerService} from 'ngx-spinner'
import {clearStore} from '../shared/utilities/system.utils'
import {NotificationService} from '../shared/services/notification.service'
import {AuthService} from '../shared/services/auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private count = 0

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private notification: NotificationService,
    private injector: Injector
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const language = 'vi-VN'
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token,
          'Accept-Language': language
        }
      })
    }
    if (request.body) {
      const encodedBody = btoa(JSON.stringify(request.body))
      request = request.clone({
        body: encodedBody
      })
    }
    if (this.count === 0) this.spinner.show()
    this.count++
    return next.handle(request).pipe(
      finalize(() => {
        this.count--
        if (this.count === 0) this.spinner.hide()
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          clearStore()
          this.router.navigate(['/'])
        } else {
          this.handleError(error)
        }
        return throwError(() => new Error(`${error}`))
      })
    )
  }

  private handleError(err: HttpErrorResponse) {
    const translate = this.injector.get(TranslateService)
    if (err.status >= 500) {
      const message = translate.instant('common.err_system')
      this.notification.error(message)
    } else if (err.error instanceof Blob) {
      const blob = new Blob([err.error], { type: 'application/json' })
      const reader = new FileReader()
      reader.onload = () => {
        const errorData = JSON.parse(reader.result as string)
        const message = errorData.message
        this.notification.error(message)
      }
      reader.readAsText(blob)
    } else {
      let message = ''
      if (err.error) {
        const errorDTO = err.error
        if (errorDTO && (errorDTO.message || errorDTO.code)) {
          message = errorDTO.message
        }

        if (errorDTO.data) {
          message = errorDTO.data[0].message
        }
      }
      // nếu lỗi mà có message thì show message
      this.notification.error(message)
    }
  }
}
let count = 0;
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router)
  const authSrv = inject(AuthService)
  const toastr = inject(NotificationService)
  const injector = inject(Injector)
  const spinner = inject(NgxSpinnerService)
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  const language = 'vi-VN'
  let request = req

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
        'Accept-Language': language
      }
    })
  }
  // if (req.body) {
  //   const encodedBody = btoa(JSON.stringify(req.body))
  //   request = req.clone({
  //     body: encodedBody
  //   })
  // }
  count++
  spinner.show()
  return next(request).pipe(
    filter((event) => event.type === HttpEventType.Response),
    map((event) => {
      count--
      if (count === 0) spinner.hide();
      return event;
    }),
    catchError((err) => {
      const translate = injector.get(TranslateService)
      count--
      if (count === 0) spinner.hide()
      if (err.status === 401) {
        clearStore()
        router.navigateByUrl('/')
        authSrv.setLoginStatus(false)
      } else if (err.status >= 400 && err.status < 500 && err.status !== 401) {
        toastr.error(err.error.message)
      } else {
        toastr.error(translate.instant('common.err_system'))
      }
      return throwError(() => err)
    })
  )
}
