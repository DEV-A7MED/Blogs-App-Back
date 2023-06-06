import { systemRoles } from "../../Utils/systemRoles.js";

export const endpoints={
    GET_ALL_USERS:[systemRoles.ADMIN],
    GET_USERS_COUNT:[systemRoles.ADMIN]
}