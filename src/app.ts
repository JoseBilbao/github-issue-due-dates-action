import * as core from "@actions/core";
import { context } from "@actions/github";
import Octokit from "./integrations/Octokit";
import {datesToDue, hasLabel} from "./utils/dateUtils";
// import { OVERDUE_TAG_NAME, NEXT_WEEK_TAG_NAME } from "./constants";
import dotenv from "dotenv";
import {sendDueMailjet} from "./utils/emailUtils";
import {NEXT_WEEK_TAG_NAME, OVERDUE_TAG_NAME, CLOSED_TAG_NAME} from "./constants";

dotenv.config();

export const run = async () => {
  try {
    const githubToken = core.getInput("GH_TOKEN");
    if (!githubToken) {
      throw new Error("Missing GH_TOKEN environment variable");
    }

    const ok = new Octokit(githubToken);

    const issues = await ok.listAllOpenIssues(context.repo.owner, context.repo.repo, "open");
    const issuesClosed = await ok.listAllOpenIssues(context.repo.owner, context.repo.repo, "closed");
    issues.concat(issuesClosed);
    // console.log("RESULT ISSUES", issues);
    const results = await ok.getIssuesWithDueDate(issues);
    for (const issue of results) {
      const daysUtilDueDate = await datesToDue(issue.due);

      // Between 0 and 7 days until due date
      if (daysUtilDueDate <= 7 && daysUtilDueDate > 0) {
        await ok.addLabelToIssue(context.repo.owner, context.repo.repo, issue.number, [NEXT_WEEK_TAG_NAME]);
      }
      // Issue is due
      if (daysUtilDueDate <= 0 && !hasLabel(issue, OVERDUE_TAG_NAME) && issue.closed_at === null) {
        await ok.removeLabelFromIssue(
          context.repo.owner,
          context.repo.repo,
          NEXT_WEEK_TAG_NAME,
          issue.number,
        );
        await ok.addLabelToIssue(context.repo.owner, context.repo.repo, issue.number, [OVERDUE_TAG_NAME]);
        // await sendDueMail();
        await sendDueMailjet(issue, "dueDate", daysUtilDueDate);
      }
      // console.log("ISSUE: ", issue)
      if (issue.closed_at && !hasLabel(issue, CLOSED_TAG_NAME)) {
        // add closed label
        await ok.addLabelToIssue(context.repo.owner, context.repo.repo, issue.number, [CLOSED_TAG_NAME]);

        // send closed email
        await sendDueMailjet(issue, "closed", daysUtilDueDate);
      }
    }
    return {
      ok: true,
      issuesProcessed: results.length,
    };
  } catch (e: any) {
    core.setFailed(e.message);
    throw e;
  }
};

run();
