import express from "express";
import bodyParser from "body-parser";
import { z } from "zod";

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return void res.send(`
    <html>
        <body>
            <form method="post" action="/submit">
                <input name="query" type="text" value="one,two,three" />
                <button type="submit">Submit</button>
            </form>
        </body>
    </html>
  `);
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const { data, error } = z
    .object({ query: z.string().trim() })
    .safeParse(req.body);

  if (error) {
    console.error(error);
    return void res.sendStatus(400).send("Bad Request");
  }

  return void res.send(`
    <html>
        <body>
            <p>Submitted: ${data.query}</p>
        </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
