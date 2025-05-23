import { sendSGModuleResponse } from "../../shared-utils/surge_module_generator";

export default async function handler(req, res) {
    return sendSGModuleResponse(req, res);
}
