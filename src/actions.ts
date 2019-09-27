import {
  URLExt
} from '@jupyterlab/coreutils';

import {
  ServerConnection
} from '@jupyterlab/services';

import {
  urlRStrip
} from './utils';


interface ImageSpecApiResponse {
  JUPYTER_IMAGE_SPEC: string;
}

interface CreateShareLinkApiResponse {
  link: string;
}


export
function getImageSpec(): Promise<string> {
  let request = {
      method: 'GET',
    };
  let settings = ServerConnection.makeSettings();
  return ServerConnection.makeRequest(
    URLExt.join(urlRStrip(settings.baseUrl), '/image-spec'),
    request, settings).then((response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.json() as Promise<ImageSpecApiResponse>;
    }).then((data) => {
      return data['JUPYTER_IMAGE_SPEC'];
    });
}

export
function createShareLink(hubHost: string, hubServices: string, path: string, imageSpec: string): Promise<string> {
  const createUrl = hubHost + URLExt.join(hubServices, `share-link/create`);
  console.log(createUrl);
  console.log(window.location.origin);
  return fetch(createUrl, {
    method: 'POST',
    body: JSON.stringify({path: path, image: imageSpec})}).then((response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.json() as Promise<CreateShareLinkApiResponse>;
    }).then((data) => {
      return data['link'];
    });
}
