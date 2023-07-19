import {Client, SendEmailV3_1, LibraryResponse} from "node-mailjet";
import dotenv from "dotenv";
import * as core from "@actions/core";
dotenv.config();

// async..await is not allowed in global scope, must use a wrapper
export async function sendDueMailjet(issue: any) {
    const mailjet = new Client({
        apiKey: core.getInput("MJ_APIKEY_PUBLIC"),
        apiSecret: core.getInput("MJ_APIKEY_PRIVATE")
    });
    console.log("ISSUE", issue);
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
                Subject: "DUE date email test!",
                HTMLPart: "<h3>this is part of html content!</h3><br />End message html" + JSON.stringify(issue),
                // TextPart: "this is a text content" + issue.due.toString(),
            },
        ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
        .post("send", {version: "v3.1"})
        .request(data);

    const {Status} = result.body.Messages[0];
}
