import { DOCUMENT } from "@angular/common";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { STORAGE_KEYS } from "../shared/constants/system.const";
import { ROUTERS } from "../shared/constants/router.const";


export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const document = inject(DOCUMENT);
    const localStorage = document.defaultView?.localStorage;
    // const userData:any =
    // localStorage?.getItem(STORAGE_KEYS.USER_DATA) ||
    // sessionStorage?.getItem(STORAGE_KEYS.USER_DATA);
    const token:any =
    localStorage?.getItem(STORAGE_KEYS.TOKEN) ||
    sessionStorage?.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        return true;
    }
    router.navigateByUrl(ROUTERS.LOGIN);
    return false;
}
