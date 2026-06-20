import { apiFetch } from "./client";

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

export const getGithubInfo = async (
  owner: string,
  repo: string,
): Promise<GithubInfo> => {
  return apiFetch(`/repositories/${owner}/${repo}/github-info`);
};
