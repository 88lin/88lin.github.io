"""Refresh GitHub counters on the personal site using the public REST API.

Updates in 2/index.html:
  - [data-github-stars]      total stars across every public repository, forks included
  - [data-github-projects]   public repository count
  - card "★ N" badges        per-repository stars, only for cards that already show a badge
  - both <time> stamps that state when the numbers were verified

Run from the repository root: python 2/scripts/update-github-stats.py
Python standard library only. Cards whose badge is a Chinese label keep that label.
"""

import argparse
import json
import os
import re
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path


SITE_DIR = Path(__file__).resolve().parents[1]
PAGE_FILE = SITE_DIR / "index.html"
OWNER = "88lin"
API_ROOT = "https://api.github.com"
CST = timezone(timedelta(hours=8))
HEADERS = {"User-Agent": "88lin-stats-refresh", "Accept": "application/vnd.github+json"}
ARTICLE = re.compile(r"<article\b[^>]*\bdata-project\b[^>]*>.*?</article>", re.S)
BADGE = re.compile(r'(<span class="b-star">★\s*)[0-9][0-9,]*(</span>)')
REPO_LINK = re.compile(r'https://github\.com/([^"/]+)/([^"/?#]+)')
TIME_STAMP = re.compile(r'(<time datetime=")\d{4}-\d{2}-\d{2}(">)(\d{4})([.-])(\d{2})\4(\d{2})(</time>)')


def request(path, token):
    headers = dict(HEADERS)
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(API_ROOT + path, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise SystemExit(f"[error] GitHub API request failed for {path}: {error}")


def public_repositories(token):
    repos, page = [], 1
    while True:
        batch = request(f"/users/{OWNER}/repos?per_page=100&page={page}", token)
        if not isinstance(batch, list):
            raise SystemExit("[error] Unexpected repository payload")
        repos.extend(batch)
        if len(batch) < 100:
            return repos
        page += 1


def counter_substitution(html, attribute, value):
    pattern = re.compile(rf"(<em {re.escape(attribute)}>)[^<]*(</em>)")
    def replace(match):
        return f"{match.group(1)}{value:,}{match.group(2)}"
    return pattern.sub(replace, html, count=1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--today", help="Override the verification date (YYYY-MM-DD), defaults to Asia/Shanghai today")
    args = parser.parse_args()
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    today = datetime.strptime(args.today, "%Y-%m-%d").date() if args.today else datetime.now(CST).date()

    account = request(f"/users/{OWNER}", token)
    repos = public_repositories(token)
    total_stars = sum(repo["stargazers_count"] for repo in repos)
    stars_by_repo = {repo["name"].lower(): repo["stargazers_count"] for repo in repos}

    source = PAGE_FILE.read_text(encoding="utf-8")
    html = counter_substitution(source, "data-github-stars", total_stars)
    html = counter_substitution(html, "data-github-projects", account["public_repos"])

    updated = []
    def refresh_card(match):
        block = match.group(0)
        link = REPO_LINK.search(block)
        if not link:
            return block
        stars = stars_by_repo.get(link.group(2).lower())
        if stars is None:
            return block
        refreshed, count = BADGE.subn(lambda m: f"{m.group(1)}{stars:,}{m.group(2)}", block)
        if count:
            updated.append((link.group(2), stars))
        return refreshed

    html = ARTICLE.sub(refresh_card, html)

    def refresh_stamp(match):
        pattern = "%Y.%m.%d" if match.group(4) == "." else "%Y-%m-%d"
        return f'{match.group(1)}{today.isoformat()}{match.group(2)}{today.strftime(pattern)}{match.group(7)}'
    html, stamps = TIME_STAMP.subn(refresh_stamp, html)

    if html == source:
        print(f"No changes: {total_stars:,} stars across {account['public_repos']} repositories.")
        return
    PAGE_FILE.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated stars: {total_stars:,} (+ forks) · repositories: {account['public_repos']} · verified {today.isoformat()}")
    print(f"Refreshed badges: " + ("、".join(f"{name} ★{stars:,}" for name, stars in updated) or "none"))
    print(f"Refreshed date stamps: {stamps}")


if __name__ == "__main__":
    main()
