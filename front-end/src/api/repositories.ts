

export interface GithubBranch {
  name: string;
  lastCommitSha: string;
}

export interface GithubPull {
  title: string;
  pullNumber: string;
}

export interface GithubIssue {
  title: string;
  issueNumber: string;
}

export interface GithubCommit {
  sha: string;
  message: string;
}

export interface GithubInfo {
  repositoryId: string;
  branches: GithubBranch[];
  pulls: GithubPull[];
  issues: GithubIssue[];
  commits: GithubCommit[];
}

import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { apiFetch } from "./client";

export const getGithubInfo = async (
  owner: string,
  repo: string,
): Promise<GithubInfo> => {
  try {
    const getGithubInfoFn = httpsCallable(functions, "getGithubInfo");
    const result = await getGithubInfoFn({ owner, repo });
    return result.data as GithubInfo;
  } catch (err) {
    console.warn("Cloud Function getGithubInfo failed or not deployed, falling back to Express backend route:", err);
    return apiFetch(`/repositories/${owner}/${repo}/github-info`);
  }
};
