const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

// Support :owner/:repo format which is easier to work with than a single URL-encoded parameter
router.get("/:owner/:repo/github-info", async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const repositoryId = `${owner}/${repo}`;
    
    // req.user is set by authMiddleware
    const user = req.user;
    if (!user || !user.githubAccessToken) {
      return res.status(401).json({ error: "User is not authenticated with GitHub" });
    }

    const githubToken = user.githubAccessToken;
    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    const baseUrl = `https://api.github.com/repos/${repositoryId}`;

    // Fetch all data concurrently
    const [branchesRes, pullsRes, issuesRes, commitsRes] = await Promise.all([
      axios.get(`${baseUrl}/branches`, { headers }).catch((e) => {
        console.error("Branches error:", e.response?.data || e.message);
        return { data: [] };
      }),
      axios.get(`${baseUrl}/pulls?state=all`, { headers }).catch((e) => {
        console.error("Pulls error:", e.response?.data || e.message);
        return { data: [] };
      }),
      axios.get(`${baseUrl}/issues?state=all`, { headers }).catch((e) => {
        console.error("Issues error:", e.response?.data || e.message);
        return { data: [] };
      }),
      axios.get(`${baseUrl}/commits`, { headers }).catch((e) => {
        console.error("Commits error:", e.response?.data || e.message);
        return { data: [] };
      }),
    ]);

    // GitHub's issues API returns PRs as well. Filter them out.
    const issuesOnly = issuesRes.data.filter((issue) => !issue.pull_request);

    const response = {
      repositoryId,
      branches: branchesRes.data.map((b) => ({
        name: b.name,
        lastCommitSha: b.commit.sha,
      })),
      pulls: pullsRes.data.map((p) => ({
        title: p.title,
        pullNumber: String(p.number),
      })),
      issues: issuesOnly.map((i) => ({
        title: i.title,
        issueNumber: String(i.number),
      })),
      commits: commitsRes.data.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error("Failed to fetch repository info:", err);
    res.status(500).json({ error: "Internal server error while fetching GitHub info" });
  }
});

module.exports = router;
