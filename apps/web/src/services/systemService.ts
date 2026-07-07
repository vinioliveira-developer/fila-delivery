import { httpRequest } from './http/httpClient';

export const SystemService = {
  version() {
    return httpRequest('/version');
  }
};
