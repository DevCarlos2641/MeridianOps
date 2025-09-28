import { CanActivateFn } from "@angular/router"

export const loginGuard: CanActivateFn = async (route, state) => {
    return true
}