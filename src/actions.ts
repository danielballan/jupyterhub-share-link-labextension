import {
  URLExt
} from '@jupyterlab/coreutils';


interface CreateShareLinkApiResponse {
  link: string;
}


// TODO
// When this commit is released (looks like it's in 2.0.0alpha1 currently...)
// https://github.com/jupyterlab/jupyterlab/commit/b750683f727485ea594d75d8efe7c0b29ecf4937
// then user the new `hubServerName` instead of `base`.

export
function createShareLink(hubHost: string, hubServices: string, base: string, path: string): Promise<string> {
  const createUrl = hubHost + URLExt.join(hubServices, `share-link/create`);
  console.log(createUrl);
  console.log(window.location.origin);
  return fetch(createUrl, {
    method: 'POST',
    body: JSON.stringify({path: path, base_url: base})}).then((response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.json() as Promise<CreateShareLinkApiResponse>;
    }).then((data) => {
      return data['link'];
    });
}
