import { systemService } from "../services/systemService.js";
import { sendSuccess } from "../utils/http.js";

export const systemController = {
  health(_request, response) {
    sendSuccess(response, 200, "API online.", systemService.health());
  },

  ready(_request, response) {
    sendSuccess(response, 200, "Aplicacao pronta para receber requisicoes.", systemService.ready());
  },

  version(_request, response) {
    sendSuccess(response, 200, "Versao carregada com sucesso.", systemService.version());
  }
};
