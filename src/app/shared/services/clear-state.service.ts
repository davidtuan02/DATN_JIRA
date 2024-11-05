import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  RouteReuseStrategy,
  DetachedRouteHandle,
  Router,
  NavigationExtras
} from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class RouteStateService implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>()

  constructor(private router: Router) {}

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (route.routeConfig && handle) {
      this.storedRoutes.set(route.routeConfig.path as string, handle)
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.storedRoutes.has(route.routeConfig.path as string)
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null
    return this.storedRoutes.get(route.routeConfig.path as string) || null
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig
  }

  clearStoredRoute(path: string): void {
    if (this.storedRoutes.has(path)) {
      this.storedRoutes.delete(path)
    }
  }

  clearAllStoredRoutes(): void {
    this.storedRoutes.clear()
  }

  // Phương thức điều hướng với xóa state và truyền dữ liệu
  clearRouteStateAndNavigate(path: string, stateData?: any): void {
    this.clearStoredRoute(path)
    const extras: NavigationExtras = {
      state: stateData
    }
    this.router.navigate([path], extras)
  }
}
