import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  return void res.send(`
    <html>
        <body>
            <form method="post" action="/submit">
                <input type="text" value="one,two,three" />
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>
  `);
});

app.post("/submit", (req, res) => {
    const req
  return void res.send(`
    <html>
        <body>
            <form method="post" action="/submit">
                <input type="text" value="one,two,three" />
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
