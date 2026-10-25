const fs = require("fs");

const rows = fs
    .readFileSync("versium.tsv", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .slice(1)
    .map((line, i) => {
        const [name, email, created, expiry, plan, partner, status] =
            line.split("\t").map((c) => c.trim());
        return {
            sNo: i + 1,
            ClientName: name,
            Email: email,
            AccountCreatedDate: created,
            AccountExpiryDate: expiry,
            SubscribtionPlan: plan,
            Partner: partner,
            MSAccountStatus: status,
        };
    });

fs.writeFileSync(
    "src/data/versiumAccounts.js",
    "export const VERSIUM_ACCOUNTS = " + JSON.stringify(rows, null, 2) + ";\n"
);
console.log(`Wrote ${rows.length} accounts`);