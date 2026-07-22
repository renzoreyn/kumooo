import { authApi, type Org, type User } from "./lib/api/auth";
import { contentApi, type ContentItem } from "./lib/api/content";
import { mediaApi } from "./lib/api/media";
import { sitesApi, type Site } from "./lib/api/sites";

export type { User, Org, Site, ContentItem };

/** Compatibility facade while pages migrate to resource modules. */
export const api = {
  me: authApi.me,
  signup: authApi.signup,
  login: authApi.login,
  logout: authApi.logout,
  orgs: authApi.orgs,
  sites: (orgId: string) => sitesApi.list(orgId),
  getSite: sitesApi.get,
  createSite: sitesApi.create,
  content: contentApi.list,
  getContent: contentApi.get,
  createContent: contentApi.create,
  updateContent: contentApi.update,
  deleteContent: contentApi.remove,
  media: mediaApi.list,
  uploadMedia: mediaApi.upload,
};
