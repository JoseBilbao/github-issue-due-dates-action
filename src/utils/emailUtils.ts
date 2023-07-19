import {Client, SendEmailV3_1, LibraryResponse} from "node-mailjet";

// async..await is not allowed in global scope, must use a wrapper
export async function sendDueMailjet() {
    const mailjet = new Client({
        apiKey: process.env.MJ_APIKEY_PUBLIC,
        apiSecret: process.env.MJ_APIKEY_PRIVATE
    });
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
                HTMLPart: "<h3>this is part of html content!</h3><br />End message html",
                TextPart: "this is a text content",
            },
        ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
        .post("send", {version: "v3.1"})
        .request(data);

    const {Status} = result.body.Messages[0];
}
