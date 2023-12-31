import {Client, SendEmailV3_1, LibraryResponse} from "node-mailjet";
import dotenv from "dotenv";
import * as core from "@actions/core";
import moment from "moment";
dotenv.config();

const typeEmails = (issue: any, daysUtilDueDate: number) => {
    return [
        {
            name: "dueDate",
            subject: `The due date has passed for ${issue.title.toUpperCase()}`,
            content: `
        <h3>Title: ${issue.title}</h3>
        <p>The due date of the task <b>${issue.title}</b> has passed </p>
        <p style="color: dimgrey"><em>The task was scheduled for the date ${moment(issue.due).format("LLL")}</em></p>    
        <p>In charge of:</p>
        <ul>
        ${issue.assignees.map((it: any) => `<li>${it.login}</li>`)}
        </ul>
        <br>`
        },
        {
            name: "closed",
            subject:  daysUtilDueDate >= 0 ?
                `Task "${issue.title.toUpperCase()}" completed successfully ${ daysUtilDueDate} days before.` :
                `Task "${issue.title.toUpperCase()}" completed successfully with ${ daysUtilDueDate * (-1)} days delay.`,
            content: `
        <h3>Title: ${issue.title}</h3>
        <p><b>${issue.title}</b> its DONE!! </p>
        <p><em>This task was completed in ${moment(issue.closed_at).format("LLL")}</em></p>
        <p style="color:${daysUtilDueDate >= 0 ? "darkgreen" : "darkred"}">${daysUtilDueDate >= 0 ? 
                `The task was completed ${daysUtilDueDate} days before` : 
                `The task was completed with ${daysUtilDueDate * (-1)} days delay`}</p>    
        <p>In charge of:</p>
        <ul>
        ${issue.assignees.map((it: any) => `<li>${it.login}</li>`)}
        </ul>
        <p>The task was closed by: <b><em>${issue.closed_by?.login}</em></b> </p>
        <br>`
        }
    ]
}

// async..await is not allowed in global scope, must use a wrapper
export async function sendDueMailjet(issue: any, type: string, daysUtilDueDate: number) {
    const mailjet = new Client({
        apiKey: core.getInput("MJ_APIKEY_PUBLIC"),
        apiSecret: core.getInput("MJ_APIKEY_PRIVATE")
    });
    console.log("ISSUE", issue);

    const types = typeEmails(issue, daysUtilDueDate);

    // looking the correct type email
    const res = types.find((it: any) => {
        return it.name === type
    })
    if (res) {
        const data: SendEmailV3_1.Body = {
            Messages: [
                {
                    From: {
                        Email: "no-reply@mymoodbit.com",
                        Name: "Moodbit",
                    },
                    To: [
                        {
                            Email: "jose@mymoodbit.com",
                        },
                    ],
                    Subject: res.subject,
                    HTMLPart: res.content,
                    // TextPart: "this is a text content" + issue.due.toString(),
                },
            ],
        };

        const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
            .post("send", {version: "v3.1"})
            .request(data);

        const {Status} = result.body.Messages[0];
    }
}
