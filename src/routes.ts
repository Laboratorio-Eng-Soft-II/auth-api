import { AuthController } from "./controllers/auth-controller"

export const Routes = [{
    method: "post",
    route: "/get-token",
    controller: AuthController,
    action: "getToken"
}, {
    method: "post",
    route: "/validate-token",
    controller: AuthController,
    action: "validateToken"
}, {
    method: "post",
    route: "/add",
    controller: AuthController,
    action: "save"
}]